import "server-only";
import type { ClientSession, Collection, Db, Document, ObjectId } from "mongodb";
import { client } from "../mongodb";

export const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["Cash on Delivery", "bKash", "Nagad"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = "Unpaid" | "Awaiting check" | "Paid";
export type ExchangeStatus = "Requested" | "Approved" | "Rejected";

export interface CategoryDoc extends Document {
  name: string;
  description: string;
  image: string;
  createdAt: Date;
}

export interface ProductDoc extends Document {
  name: string;
  categoryId: ObjectId;
  category: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDoc {
  productId: ObjectId;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface OrderDoc extends Document {
  orderNo: string;
  userEmail: string;
  userName: string;
  items: OrderItemDoc[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: { name: string; phone: string; address: string; city: string };
  payment: { method: PaymentMethod; status: PaymentStatus; senderNumber?: string; transactionId?: string };
  exchange?: { status: ExchangeStatus; reason: string; requestedAt: Date };
  status: OrderStatus;
  history: { status: OrderStatus; at: Date }[];
  createdAt: Date;
}

let indexes: Promise<unknown> | null = null;

// Uses the same MongoDB connection as BetterAuth
export async function getDb(): Promise<Db> {
  const db = client.db(process.env.DB_NAME || "shopdesk");
  indexes ??= Promise.all([
    db.collection("categories").createIndex({ name: 1 }, { unique: true }),
    db.collection("products").createIndex({ categoryId: 1, price: 1 }),
    db.collection("orders").createIndex({ orderNo: 1 }, { unique: true }),
    db.collection("orders").createIndex({ userEmail: 1, createdAt: -1 }),
  ]).catch((err) => {
    indexes = null;
    throw err;
  });
  await indexes;
  return db;
}

export async function collections() {
  const db = await getDb();
  return {
    categories: db.collection<CategoryDoc>("categories") as Collection<CategoryDoc>,
    products: db.collection<ProductDoc>("products") as Collection<ProductDoc>,
    orders: db.collection<OrderDoc>("orders") as Collection<OrderDoc>,
    counters: db.collection<{ _id: string; value: number }>("counters"),
    // Accounts are created by BetterAuth
    users: db.collection<{ name: string; email: string; image?: string; role?: string; createdAt: Date }>("user"),
  };
}

// An order and its stock change must succeed or fail together
export async function inTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
  await getDb();
  const session = client.startSession();
  try {
    return await session.withTransaction(() => work(session));
  } finally {
    await session.endSession();
  }
}
