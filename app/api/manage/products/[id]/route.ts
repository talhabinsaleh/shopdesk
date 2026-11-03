import { readProduct } from "@/lib/server/admin";
import { collections } from "@/lib/server/db";
import { apiAdmin, asObjectId, HttpError, readBody, route } from "@/lib/server/http";

export const PUT = route(async (request, { id }) => {
  await apiAdmin();
  const { products } = await collections();
  const values = await readProduct(await readBody(request));
  const result = await products.updateOne({ _id: asObjectId(id) }, { $set: { ...values, updatedAt: new Date() } });
  if (!result.matchedCount) throw new HttpError(404, "Product not found.");
  return { ok: true };
});

// Orders keep their own copy of the name and price, so old orders stay readable
export const DELETE = route(async (_request, { id }) => {
  await apiAdmin();
  const { products } = await collections();
  const result = await products.deleteOne({ _id: asObjectId(id) });
  if (!result.deletedCount) throw new HttpError(404, "Product not found.");
  return { ok: true };
});
