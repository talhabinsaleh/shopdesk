import { collections } from "@/lib/server/db";
import { apiAdmin, apiUser, asObjectId, created, HttpError, readBody, route, text } from "@/lib/server/http";

const EXCHANGE_DAYS = 7;

// The customer asks for an exchange within 7 days of delivery
export const POST = route(async (request, params) => {
  const user = await apiUser();
  const { orders } = await collections();
  const id = asObjectId(params.id);
  const reason = text((await readBody(request)).reason, "Reason", { min: 5, max: 500 });
  const order = await orders.findOne({ _id: id, userEmail: user.email });
  if (!order) throw new HttpError(404, "Order not found.");
  if (order.status !== "Delivered") throw new HttpError(409, "You can ask for an exchange after your order is delivered.");
  if (order.exchange) throw new HttpError(409, "An exchange was already requested for this order.");
  const delivered = order.history.find((entry) => entry.status === "Delivered")?.at ?? order.createdAt;
  if (Date.now() - new Date(delivered).getTime() > EXCHANGE_DAYS * 24 * 60 * 60 * 1000) {
    throw new HttpError(409, `Exchanges are open for ${EXCHANGE_DAYS} days after delivery.`);
  }
  await orders.updateOne({ _id: id }, { $set: { exchange: { status: "Requested", reason, requestedAt: new Date() } } });
  return created({ ok: true });
});

// The admin approves or rejects it
export const PATCH = route(async (request, params) => {
  await apiAdmin();
  const { orders } = await collections();
  const status = (await readBody(request)).status;
  if (status !== "Approved" && status !== "Rejected") throw new HttpError(400, "Please choose approve or reject.");
  const result = await orders.updateOne({ _id: asObjectId(params.id), "exchange.status": "Requested" }, { $set: { "exchange.status": status } });
  if (!result.modifiedCount) throw new HttpError(409, "This exchange is not waiting for a decision.");
  return { ok: true };
});
