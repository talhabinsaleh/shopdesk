import type { ClientSession, ObjectId, PushOperator } from "mongodb";
import { collections, type OrderDoc, type OrderStatus } from "../config/db.js";
import { HttpError } from "./validate.js";

// The status each order can move to next. Cancelling is allowed until the parcel ships.
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export async function changeStatus(id: ObjectId, status: OrderStatus, session: ClientSession) {
  const { orders, products } = await collections();
  const order = await orders.findOne({ _id: id }, { session });
  if (!order) throw new HttpError(404, "Order not found.");
  if (!NEXT[order.status].includes(status)) throw new HttpError(409, `An order that is ${order.status} cannot change to ${status}.`);

  // The status in the filter stops two changes to the same order at once.
  // Cash is collected at the door, so delivery also marks a cash order as paid.
  const paid = status === "Delivered" && order.payment.method === "Cash on Delivery";
  const updated = await orders.updateOne(
    { _id: id, status: order.status },
    { $set: { status, ...(paid ? { "payment.status": "Paid" } : {}) }, $push: { history: { status, at: new Date() } } as unknown as PushOperator<OrderDoc> },
    { session },
  );
  if (!updated.modifiedCount) throw new HttpError(409, "This order was just changed. Please reload.");

  if (status === "Cancelled") {
    for (const item of order.items) {
      await products.updateOne({ _id: item.productId }, { $inc: { stock: item.qty } }, { session });
    }
  }
}
