import "server-only";
import { featuredProducts, findProduct, listCategories, searchProducts } from "@/lib/server/catalog";
import { HttpError } from "@/lib/server/http";
import type { Category, Paged, Product } from "@/lib/shared/types";

// Pages read the database directly. The JSON round trip turns ObjectIds and dates into
// the plain strings the page components expect, the same shape the API routes send.
const plain = <T,>(value: unknown): T => JSON.parse(JSON.stringify(value));

export async function getCategories() {
  return plain<Category[]>(await listCategories());
}

export async function getFeatured() {
  return plain<Product[]>(await featuredProducts());
}

export async function getProducts(query: string) {
  return plain<Paged<Product>>(await searchProducts(new URLSearchParams(query)));
}

export async function getProduct(id: string) {
  try {
    return plain<Product>(await findProduct(id));
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
}
