import { ObjectId } from "mongodb";
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from "@/lib/format";
import { collections, inTransaction, PAYMENT_METHODS, type OrderDoc, type OrderItemDoc, type PaymentMethod } from "@/lib/server/db";
import { apiUser, asObjectId, created, HttpError, number, readBody, route, text } from "@/lib/server/http";

const PHONE = /^(\+?88)?01[3-9]\d{8}$/;
const isPhone = (value: string) => PHONE.test(value.replace(/[\s-]/g, ""));

type Fields = Record<string, unknown> | undefined;

function readPayment(body: Fields): OrderDoc["payment"] {
  const method = body?.method as PaymentMethod;
  if (!PAYMENT_METHODS.includes(method)) throw new HttpError(400, "Please choose a payment method.");
  if (method === "Cash on Delivery") return { method, status: "Unpaid" };
  const senderNumber = text(body?.senderNumber, `${method} number`, { max: 20 });
  if (!isPhone(senderNumber)) throw new HttpError(400, `Please enter the ${method} number you paid from.`);
  const transactionId = text(body?.transactionId, "Transaction ID", { min: 6, max: 20 }).toUpperCase();
  if (!/^[A-Z0-9]+$/.test(transactionId)) throw new HttpError(400, "A transaction ID has only letters and numbers.");
  return { method, status: "Awaiting check", senderNumber, transactionId };
}

// Prices come from the database, never from the browser
export const POST = route(async (request) => {
  const user = await apiUser();
  const body = await readBody(request);
  const lines = body.items;
  if (!Array.isArray(lines) || lines.length === 0) throw new HttpError(400, "Your cart is empty.");
  if (lines.length > 50) throw new HttpError(400, "An order can have up to 50 products.");
  const quantities = new Map<string, number>();
  for (const item of lines) {
    const id = String(asObjectId(item?.productId));
    quantities.set(id, (quantities.get(id) ?? 0) + number(item?.qty, "Quantity", { min: 1, max: 999, integer: true }));
  }
  const fields = body.delivery as Fields;
  const delivery = {
    name: text(fields?.name, "Name", { max: 80 }),
    phone: text(fields?.phone, "Phone", { max: 20 }),
    address: text(fields?.address, "Address", { max: 300 }),
    city: text(fields?.city, "City", { max: 60 }),
  };
  if (!isPhone(delivery.phone)) throw new HttpError(400, "Please enter a valid Bangladeshi phone number, like 01712345678.");
  const payment = readPayment(body.payment as Fields);

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
  return created(order);
});
