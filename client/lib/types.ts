export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Product {
  _id: string;
  name: string;
  categoryId: string;
  category: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  stock: number;
  featured: boolean;
  createdAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface Order {
  _id: string;
  orderNo: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: { name: string; phone: string; address: string; city: string };
  payment: { method: string; status: "Unpaid" | "Awaiting check" | "Paid"; senderNumber?: string; transactionId?: string };
  exchange?: { status: "Requested" | "Approved" | "Rejected"; reason: string; requestedAt: string };
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  createdAt: string;
}

export interface CustomerRow {
  _id: string;
  name: string;
  email: string;
  image?: string;
  spent: number;
  orderCount: number;
  lastOrder: string | null;
}

export interface DayPoint {
  day: string;
  sales: number;
  orders: number;
}

export interface Overview {
  salesToday: number;
  pending: number;
  exchanges: number;
  payments: number;
  customers: number;
  days: DayPoint[];
  lowStock: Pick<Product, "_id" | "name" | "image" | "stock">[];
  recent: Pick<Order, "_id" | "orderNo" | "userName" | "total" | "status" | "createdAt">[];
}

// The logged-in user, as BetterAuth on the API returns it
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}
