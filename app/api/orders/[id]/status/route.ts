import { inTransaction, ORDER_STATUSES, type OrderStatus } from "@/lib/server/db";
import { apiAdmin, asObjectId, HttpError, readBody, route } from "@/lib/server/http";
import { changeStatus } from "@/lib/server/orders";

export const PATCH = route(async (request, params) => {
  await apiAdmin();
  const status = (await readBody(request)).status as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Please choose a valid status.");
  const id = asObjectId(params.id);
  await inTransaction((session) => changeStatus(id, status, session));
  return { ok: true };
});
