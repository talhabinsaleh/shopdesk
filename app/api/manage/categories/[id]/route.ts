import { readCategory } from "@/lib/server/admin";
import { collections } from "@/lib/server/db";
import { apiAdmin, asObjectId, HttpError, readBody, route } from "@/lib/server/http";

export const PUT = route(async (request, params) => {
  await apiAdmin();
  const { categories, products } = await collections();
  const id = asObjectId(params.id);
  const values = readCategory(await readBody(request));
  const result = await categories.updateOne({ _id: id }, { $set: values });
  if (!result.matchedCount) throw new HttpError(404, "Category not found.");
  await products.updateMany({ categoryId: id }, { $set: { category: values.name } });
  return { ok: true };
});

export const DELETE = route(async (_request, params) => {
  await apiAdmin();
  const { categories, products } = await collections();
  const id = asObjectId(params.id);
  const used = await products.countDocuments({ categoryId: id });
  if (used) throw new HttpError(409, `Move or delete the ${used} products in this category first.`);
  const result = await categories.deleteOne({ _id: id });
  if (!result.deletedCount) throw new HttpError(404, "Category not found.");
  return { ok: true };
});
