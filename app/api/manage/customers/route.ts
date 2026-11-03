import { collections } from "@/lib/server/db";
import { apiAdmin, escapeRegex, pageOf, paging, query, route } from "@/lib/server/http";

// Cancelled orders do not count towards what a customer has spent
export const GET = route(async (request) => {
  await apiAdmin();
  const params = query(request);
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
  return pageOf(items, total, page, limit);
});
