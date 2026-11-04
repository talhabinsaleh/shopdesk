import "server-only";
import { headers } from "next/headers";
import type { Category, Paged, Product } from "@/lib/types";

// Server-rendered pages ask the Express API (the server/ folder) for their data.
// In the browser the same API is reached through this site's /api address (see next.config.ts).
export const API_URL = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

class ApiDown extends Error {}

// Sends the visitor's login cookie along when asked, so the API knows who is looking
export async function fromApi<T>(path: string, { withLogin = false } = {}): Promise<T | null> {
  const cookie = withLogin ? (await headers()).get("cookie") : null;
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store", headers: cookie ? { cookie } : undefined }).catch(() => {
    throw new ApiDown(`The ShopDesk API at ${API_URL} is not reachable. Is the server running?`);
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`The API answered ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

export async function getCategories() {
  return (await fromApi<Category[]>("/api/categories")) ?? [];
}

export async function getFeatured() {
  return (await fromApi<Product[]>("/api/products/featured")) ?? [];
}

export async function getProducts(query: string) {
  return (await fromApi<Paged<Product>>(`/api/products?${query}`)) ?? { items: [], total: 0, page: 1, pages: 1 };
}

export async function getProduct(id: string) {
  return fromApi<Product>(`/api/products/${encodeURIComponent(id)}`);
}

// Which optional features the API has set up, such as Google login
export async function getSettings() {
  return (await fromApi<{ googleLogin: boolean }>("/api/settings")) ?? { googleLogin: false };
}
