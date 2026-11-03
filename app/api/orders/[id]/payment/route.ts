import { collections } from "@/lib/server/db";
import { apiAdmin, asObjectId, HttpError, route } from "@/lib/server/http";

// The admin marks a bKash or Nagad order as paid after finding the transaction in the account
export const PATCH = route(async (_request, { id }) => {
  await apiAdmin();
  const { orders } = await collections();
  const result = await orders.updateOne({ _id: asObjectId(id), "payment.status": "Awaiting check" }, { $set: { "payment.status": "Paid" } });
  if (!result.modifiedCount) throw new HttpError(409, "This payment is not waiting to be checked.");
  return { ok: true };
});
