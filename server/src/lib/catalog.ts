import { ObjectId, type Filter, type Sort } from "mongodb";
import { collections, type ProductDoc } from "../config/db.js";
import { asObjectId, escapeRegex, HttpError, pageOf, paging } from "./validate.js";

// Used by both the public API routes and the shop pages

export async function listCategories() {
  const { categories, products } = await collections();
  const [list, counts] = await Promise.all([
    categories.find().sort({ name: 1 }).toArray(),
    products.aggregate<{ _id: unknown; count: number }>([{ $group: { _id: "$categoryId", count: { $sum: 1 } } }]).toArray(),
  ]);
  const byId = new Map(counts.map((row) => [String(row._id), row.count]));
  return list.map((category) => ({ ...category, productCount: byId.get(String(category._id)) ?? 0 }));
}

export async function featuredProducts() {
  const { products } = await collections();
  return products.find({ featured: true }).sort({ createdAt: -1 }).limit(8).toArray();
}

// The cart re-reads its products, so a saved cart always shows today's price and stock
export async function productsByIds(ids: string) {
  const { products } = await collections();
  const list = ids.split(",").filter((id) => ObjectId.isValid(id)).slice(0, 50).map((id) => new ObjectId(id));
  return products.find({ _id: { $in: list } }).toArray();
}

const SORTS: Record<string, Sort> = {
  newest: { createdAt: -1, _id: -1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
};

export async function searchProducts(params: URLSearchParams) {
  const { products } = await collections();
  const { page, limit, skip } = paging(params, 12);
  const filter: Filter<ProductDoc> = {};
  const search = params.get("search")?.trim();
  if (search) {
    // Match the words anywhere a shopper might look: name, category or description
    const pattern = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ name: pattern }, { category: pattern }, { description: pattern }];
  }
  const category = params.get("category");
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    products.find(filter).sort(SORTS[params.get("sort") ?? ""] ?? SORTS.newest).skip(skip).limit(limit).toArray(),
    products.countDocuments(filter),
  ]);
  return pageOf(items, total, page, limit);
}

export async function findProduct(id: string) {
  const { products } = await collections();
  const product = await products.findOne({ _id: asObjectId(id) });
  if (!product) throw new HttpError(404, "Product not found.");
  return product;
}
