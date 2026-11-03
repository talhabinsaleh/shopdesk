import { readCategory } from "@/lib/server/admin";
import { collections } from "@/lib/server/db";
import { apiAdmin, created, readBody, route } from "@/lib/server/http";

export const POST = route(async (request) => {
  await apiAdmin();
  const { categories } = await collections();
  const { insertedId } = await categories.insertOne({ ...readCategory(await readBody(request)), createdAt: new Date() });
  return created({ _id: insertedId });
});
