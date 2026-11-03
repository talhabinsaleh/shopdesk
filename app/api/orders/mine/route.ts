import { collections } from "@/lib/server/db";
import { apiUser, route } from "@/lib/server/http";

export const GET = route(async () => {
  const user = await apiUser();
  const { orders } = await collections();
  return orders.find({ userEmail: user.email }).sort({ createdAt: -1 }).limit(100).toArray();
});
