import { collections } from "@/lib/server/db";
import { LOW_STOCK } from "@/lib/server/admin";
import { apiAdmin, dayStart, route, TIME_ZONE } from "@/lib/server/http";

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);

export const GET = route(async () => {
  await apiAdmin();
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
  return { salesToday: days[13].sales, pending, exchanges, payments, customers, days, lowStock, recent };
});
