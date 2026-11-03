import { collections } from "@/lib/server/db";
import { apiUser, asObjectId, HttpError, route } from "@/lib/server/http";

// Customers see their own orders. The admin sees every order.
export const GET = route(async (_request, { id }) => {
  const user = await apiUser();
  const { orders } = await collections();
  const order = await orders.findOne({ _id: asObjectId(id) });
  if (!order || (order.userEmail !== user.email && user.role !== "admin")) throw new HttpError(404, "Order not found.");
  return order;
});
