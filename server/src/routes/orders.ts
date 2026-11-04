import { Router } from "express";
import { ObjectId, type Filter } from "mongodb";
import { collections, inTransaction, ORDER_STATUSES, PAYMENT_METHODS, type OrderDoc, type OrderItemDoc, type OrderStatus, type PaymentMethod } from "../config/db.js";
import { changeStatus } from "../lib/orders.js";
import { asObjectId, body, escapeRegex, HttpError, number, pageOf, paging, queryParams, text } from "../lib/validate.js";
import { requireAdmin, requireUser } from "../middleware/auth.js";

// Keep these two in step with client/lib/format.ts, which shows them in the cart
const DELIVERY_FEE = 80;
const FREE_DELIVERY_FROM = 5000;
const EXCHANGE_DAYS = 7;

const PHONE = /^(\+?88)?01[3-9]\d{8}$/;
const isPhone = (value: string) => PHONE.test(value.replace(/[\s-]/g, ""));

type Fields = Record<string, unknown> | undefined;

function readPayment(fields: Fields): OrderDoc["payment"] {
  const method = fields?.method as PaymentMethod;
  if (!PAYMENT_METHODS.includes(method)) throw new HttpError(400, "Please choose a payment method.");
  if (method === "Cash on Delivery") return { method, status: "Unpaid" };
  const senderNumber = text(fields?.senderNumber, `${method} number`, { max: 20 });
  if (!isPhone(senderNumber)) throw new HttpError(400, `Please enter the ${method} number you paid from.`);
  const transactionId = text(fields?.transactionId, "Transaction ID", { min: 6, max: 20 }).toUpperCase();
  if (!/^[A-Z0-9]+$/.test(transactionId)) throw new HttpError(400, "A transaction ID has only letters and numbers.");
  return { method, status: "Awaiting check", senderNumber, transactionId };
}

const router = Router();

// Place an order. Prices come from the database, never from the browser.
router.post("/", requireUser, async (req, res) => {
  const user = res.locals.user;
  const data = body(req.body);
  const lines = data.items;
  if (!Array.isArray(lines) || lines.length === 0) throw new HttpError(400, "Your cart is empty.");
  if (lines.length > 50) throw new HttpError(400, "An order can have up to 50 products.");
  const quantities = new Map<string, number>();
  for (const item of lines) {
    const id = String(asObjectId(item?.productId));
    quantities.set(id, (quantities.get(id) ?? 0) + number(item?.qty, "Quantity", { min: 1, max: 999, integer: true }));
  }
  const fields = data.delivery as Fields;
  const delivery = {
    name: text(fields?.name, "Name", { max: 80 }),
    phone: text(fields?.phone, "Phone", { max: 20 }),
    address: text(fields?.address, "Address", { max: 300 }),
    city: text(fields?.city, "City", { max: 60 }),
  };
  if (!isPhone(delivery.phone)) throw new HttpError(400, "Please enter a valid Bangladeshi phone number, like 01712345678.");
  const payment = readPayment(data.payment as Fields);

  const { products, orders, counters } = await collections();
  const order = await inTransaction(async (session) => {
    const now = new Date();
    const items: OrderItemDoc[] = [];
    for (const [id, qty] of quantities) {
      const productId = new ObjectId(id);
      // Only takes stock when enough is left, so two buyers cannot get the last item
      const product = await products.findOneAndUpdate({ _id: productId, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { session });
      if (!product) {
        const current = await products.findOne({ _id: productId }, { session, projection: { name: 1, stock: 1 } });
        throw new HttpError(409, current
          ? `Only ${current.stock} left of ${current.name}. Please update your cart.`
          : "A product in your cart is no longer sold. Please remove it.");
      }
      items.push({ productId, name: product.name, image: product.image, price: product.price, qty });
    }
    const counter = await counters.findOneAndUpdate({ _id: "order" }, { $inc: { value: 1 } }, { session, upsert: true, returnDocument: "after" });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const doc: OrderDoc = {
      orderNo: `SD-${1000 + counter!.value}`,
      userEmail: user.email,
      userName: user.name,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      delivery,
      payment,
      status: "Pending",
      history: [{ status: "Pending", at: now }],
      createdAt: now,
    };
    const { insertedId } = await orders.insertOne(doc, { session });
    return { _id: insertedId, orderNo: doc.orderNo };
  });
  res.status(201).json(order);
});

// A customer's own orders
router.get("/mine", requireUser, async (_req, res) => {
  const { orders } = await collections();
  res.json(await orders.find({ userEmail: res.locals.user.email }).sort({ createdAt: -1 }).limit(100).toArray());
});

// Admin: every order, with search, status and the quick filters behind the Overview cards
router.get("/all", requireAdmin, async (req, res) => {
  const params = queryParams(req.query);
  const { orders } = await collections();
  const { page, limit, skip } = paging(params, 15);
  const filter: Filter<OrderDoc> = {};
  const status = params.get("status") as OrderStatus;
  if (ORDER_STATUSES.includes(status)) filter.status = status;
  const show = params.get("show");
  if (show === "new") filter.status = "Pending";
  if (show === "payments") Object.assign(filter, { "payment.status": "Awaiting check", status: { $ne: "Cancelled" } });
  if (show === "exchanges") filter["exchange.status"] = "Requested";
  const search = params.get("search")?.trim();
  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ orderNo: pattern }, { userName: pattern }, { userEmail: pattern }, { "delivery.phone": pattern }];
  }
  const [items, total] = await Promise.all([
    orders.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    orders.countDocuments(filter),
  ]);
  res.json(pageOf(items, total, page, limit));
});

// Customers see their own orders. The admin sees every order.
router.get("/:id", requireUser, async (req, res) => {
  const user = res.locals.user;
  const { orders } = await collections();
  const order = await orders.findOne({ _id: asObjectId(req.params.id) });
  if (!order || (order.userEmail !== user.email && user.role !== "admin")) throw new HttpError(404, "Order not found.");
  res.json(order);
});

// The customer cancels while the order is still pending
router.patch("/:id/cancel", requireUser, async (req, res) => {
  const { orders } = await collections();
  const id = asObjectId(req.params.id);
  const own = await orders.findOne({ _id: id, userEmail: res.locals.user.email }, { projection: { status: 1 } });
  if (!own) throw new HttpError(404, "Order not found.");
  if (own.status !== "Pending") throw new HttpError(409, "This order can no longer be cancelled.");
  await inTransaction((session) => changeStatus(id, "Cancelled", session));
  res.json({ ok: true });
});

// Admin: move the order to its next status
router.patch("/:id/status", requireAdmin, async (req, res) => {
  const status = body(req.body).status as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Please choose a valid status.");
  const id = asObjectId(req.params.id);
  await inTransaction((session) => changeStatus(id, status, session));
  res.json({ ok: true });
});

// Admin: mark a bKash or Nagad order as paid after finding the transaction in the account
router.patch("/:id/payment", requireAdmin, async (req, res) => {
  const { orders } = await collections();
  const result = await orders.updateOne({ _id: asObjectId(req.params.id), "payment.status": "Awaiting check" }, { $set: { "payment.status": "Paid" } });
  if (!result.modifiedCount) throw new HttpError(409, "This payment is not waiting to be checked.");
  res.json({ ok: true });
});

// The customer asks for an exchange within 7 days of delivery
router.post("/:id/exchange", requireUser, async (req, res) => {
  const { orders } = await collections();
  const id = asObjectId(req.params.id);
  const reason = text(body(req.body).reason, "Reason", { min: 5, max: 500 });
  const order = await orders.findOne({ _id: id, userEmail: res.locals.user.email });
  if (!order) throw new HttpError(404, "Order not found.");
  if (order.status !== "Delivered") throw new HttpError(409, "You can ask for an exchange after your order is delivered.");
  if (order.exchange) throw new HttpError(409, "An exchange was already requested for this order.");
  const delivered = order.history.find((entry) => entry.status === "Delivered")?.at ?? order.createdAt;
  if (Date.now() - new Date(delivered).getTime() > EXCHANGE_DAYS * 24 * 60 * 60 * 1000) {
    throw new HttpError(409, `Exchanges are open for ${EXCHANGE_DAYS} days after delivery.`);
  }
  await orders.updateOne({ _id: id }, { $set: { exchange: { status: "Requested", reason, requestedAt: new Date() } } });
  res.status(201).json({ ok: true });
});

// Admin: approve or reject the exchange
router.patch("/:id/exchange", requireAdmin, async (req, res) => {
  const { orders } = await collections();
  const status = body(req.body).status;
  if (status !== "Approved" && status !== "Rejected") throw new HttpError(400, "Please choose approve or reject.");
  const result = await orders.updateOne({ _id: asObjectId(req.params.id), "exchange.status": "Requested" }, { $set: { "exchange.status": status } });
  if (!result.modifiedCount) throw new HttpError(409, "This exchange is not waiting for a decision.");
  res.json({ ok: true });
});

export default router;
