import { Router } from "express";
import type { Filter } from "mongodb";
import { collections, type ProductDoc } from "../config/db.js";
import { LOW_STOCK, readCategory, readProduct } from "../lib/admin.js";
import { asObjectId, body, dayStart, escapeRegex, HttpError, pageOf, paging, queryParams, TIME_ZONE } from "../lib/validate.js";
import { requireAdmin } from "../middleware/auth.js";

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);

// Admin dashboard. Every route here needs an admin login.
const router = Router();
router.use(requireAdmin);

// The numbers on the Overview page
router.get("/overview", async (_req, res) => {
  const { orders, products, users } = await collections();
  const today = dayStart(dayKey(new Date()));
  const from = new Date(today.getTime() - 13 * DAY);

  const [rows, pending, exchanges, payments, lowStock, recent, customers] = await Promise.all([
    orders.aggregate<{ _id: string; sales: number; orders: number }>([
      { $match: { createdAt: { $gte: from, $lt: new Date(today.getTime() + DAY) }, status: { $ne: "Cancelled" } } },
      { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: TIME_ZONE } }, sales: { $sum: "$subtotal" }, orders: { $sum: 1 } } },
    ]).toArray(),
    orders.countDocuments({ status: "Pending" }),
    orders.countDocuments({ "exchange.status": "Requested" }),
    orders.countDocuments({ "payment.status": "Awaiting check", status: { $ne: "Cancelled" } }),
    products.find({ stock: { $lte: LOW_STOCK } }, { projection: { name: 1, image: 1, stock: 1 } }).sort({ stock: 1 }).limit(6).toArray(),
    orders.find({}, { projection: { orderNo: 1, userName: 1, total: 1, status: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(6).toArray(),
    users.countDocuments({ role: { $ne: "admin" } }),
  ]);

  const byDay = new Map(rows.map((row) => [row._id, row]));
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = dayKey(new Date(from.getTime() + index * DAY));
    return { day, sales: byDay.get(day)?.sales ?? 0, orders: byDay.get(day)?.orders ?? 0 };
  });
  res.json({ salesToday: days[13].sales, pending, exchanges, payments, customers, days, lowStock, recent });
});

// Customers with what they have spent. Cancelled orders do not count.
router.get("/customers", async (req, res) => {
  const params = queryParams(req.query);
  const { users, orders } = await collections();
  const { page, limit, skip } = paging(params, 15);
  const search = params.get("search")?.trim() ?? "";
  const pattern = { $regex: escapeRegex(search), $options: "i" };
  const filter = { role: { $ne: "admin" }, ...(search ? { $or: [{ name: pattern }, { email: pattern }] } : {}) };
  const [list, total] = await Promise.all([
    users.find(filter, { projection: { name: 1, email: 1, image: 1 } }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    users.countDocuments(filter),
  ]);
  const stats = await orders.aggregate<{ _id: string; spent: number; count: number; last: Date }>([
    { $match: { userEmail: { $in: list.map((user) => user.email) }, status: { $ne: "Cancelled" } } },
    { $group: { _id: "$userEmail", spent: { $sum: "$total" }, count: { $sum: 1 }, last: { $max: "$createdAt" } } },
  ]).toArray();
  const byEmail = new Map(stats.map((row) => [row._id, row]));
  const items = list.map((user) => ({
    ...user,
    spent: byEmail.get(user.email)?.spent ?? 0,
    orderCount: byEmail.get(user.email)?.count ?? 0,
    lastOrder: byEmail.get(user.email)?.last ?? null,
  }));
  res.json(pageOf(items, total, page, limit));
});

// Products
router.get("/products", async (req, res) => {
  const params = queryParams(req.query);
  const { products } = await collections();
  const { page, limit, skip } = paging(params, 15);
  const filter: Filter<ProductDoc> = {};
  const search = params.get("search")?.trim();
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
  if (params.get("stock") === "low") filter.stock = { $lte: LOW_STOCK };
  const [items, total] = await Promise.all([
    products.find(filter).sort({ name: 1 }).skip(skip).limit(limit).toArray(),
    products.countDocuments(filter),
  ]);
  res.json(pageOf(items, total, page, limit));
});

router.post("/products", async (req, res) => {
  const { products } = await collections();
  const now = new Date();
  const { insertedId } = await products.insertOne({ ...(await readProduct(body(req.body))), createdAt: now, updatedAt: now });
  res.status(201).json({ _id: insertedId });
});

router.put("/products/:id", async (req, res) => {
  const { products } = await collections();
  const values = await readProduct(body(req.body));
  const result = await products.updateOne({ _id: asObjectId(req.params.id) }, { $set: { ...values, updatedAt: new Date() } });
  if (!result.matchedCount) throw new HttpError(404, "Product not found.");
  res.json({ ok: true });
});

// Orders keep their own copy of the name and price, so old orders stay readable
router.delete("/products/:id", async (req, res) => {
  const { products } = await collections();
  const result = await products.deleteOne({ _id: asObjectId(req.params.id) });
  if (!result.deletedCount) throw new HttpError(404, "Product not found.");
  res.json({ ok: true });
});

// Categories
router.post("/categories", async (req, res) => {
  const { categories } = await collections();
  const { insertedId } = await categories.insertOne({ ...readCategory(body(req.body)), createdAt: new Date() });
  res.status(201).json({ _id: insertedId });
});

router.put("/categories/:id", async (req, res) => {
  const { categories, products } = await collections();
  const id = asObjectId(req.params.id);
  const values = readCategory(body(req.body));
  const result = await categories.updateOne({ _id: id }, { $set: values });
  if (!result.matchedCount) throw new HttpError(404, "Category not found.");
  await products.updateMany({ categoryId: id }, { $set: { category: values.name } });
  res.json({ ok: true });
});

router.delete("/categories/:id", async (req, res) => {
  const { categories, products } = await collections();
  const id = asObjectId(req.params.id);
  const used = await products.countDocuments({ categoryId: id });
  if (used) throw new HttpError(409, `Move or delete the ${used} products in this category first.`);
  const result = await categories.deleteOne({ _id: id });
  if (!result.deletedCount) throw new HttpError(404, "Category not found.");
  res.json({ ok: true });
});

export default router;
