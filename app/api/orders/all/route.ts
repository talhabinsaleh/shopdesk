import type { Filter } from "mongodb";
import { collections, ORDER_STATUSES, type OrderDoc, type OrderStatus } from "@/lib/server/db";
import { apiAdmin, escapeRegex, pageOf, paging, query, route } from "@/lib/server/http";

export const GET = route(async (request) => {
  await apiAdmin();
  const params = query(request);
  const { orders } = await collections();
  const { page, limit, skip } = paging(params, 15);
  const filter: Filter<OrderDoc> = {};
  const status = params.get("status") as OrderStatus;
  if (ORDER_STATUSES.includes(status)) filter.status = status;
  if (params.get("exchange") === "Requested") filter["exchange.status"] = "Requested";
  const search = params.get("search")?.trim();
  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ orderNo: pattern }, { userName: pattern }, { userEmail: pattern }, { "delivery.phone": pattern }];
  }
  const [items, total] = await Promise.all([
    orders.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    orders.countDocuments(filter),
  ]);
  return pageOf(items, total, page, limit);
});
