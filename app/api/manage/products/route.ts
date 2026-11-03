import type { Filter } from "mongodb";
import { LOW_STOCK, readProduct } from "@/lib/server/admin";
import { collections, type ProductDoc } from "@/lib/server/db";
import { apiAdmin, created, escapeRegex, pageOf, paging, query, readBody, route } from "@/lib/server/http";

export const GET = route(async (request) => {
  await apiAdmin();
  const params = query(request);
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
  return pageOf(items, total, page, limit);
});

export const POST = route(async (request) => {
  await apiAdmin();
  const { products } = await collections();
  const now = new Date();
  const { insertedId } = await products.insertOne({ ...(await readProduct(await readBody(request))), createdAt: now, updatedAt: now });
  return created({ _id: insertedId });
});
