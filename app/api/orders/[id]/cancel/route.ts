import { collections, inTransaction } from "@/lib/server/db";
import { apiUser, asObjectId, HttpError, route } from "@/lib/server/http";
import { changeStatus } from "@/lib/server/orders";

export const PATCH = route(async (_request, params) => {
  const user = await apiUser();
  const { orders } = await collections();
  const id = asObjectId(params.id);
  const own = await orders.findOne({ _id: id, userEmail: user.email }, { projection: { status: 1 } });
  if (!own) throw new HttpError(404, "Order not found.");
  if (own.status !== "Pending") throw new HttpError(409, "This order can no longer be cancelled.");
  await inTransaction((session) => changeStatus(id, "Cancelled", session));
  return { ok: true };
});
