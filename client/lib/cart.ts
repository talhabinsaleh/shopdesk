"use client";

import { useSyncExternalStore } from "react";
import type { Product } from "@/lib/types";

export interface CartLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  qty: number;
}

const KEY = "shopdesk-cart";
const EMPTY: CartLine[] = [];
let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (lines) return lines;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    lines = Array.isArray(saved) ? saved : [];
  } catch {
    lines = [];
  }
  return lines as CartLine[];
}

function write(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The cart still works for this visit when storage is blocked
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(product: Pick<Product, "_id" | "name" | "image" | "price" | "stock">, qty = 1) {
  const current = read();
  const existing = current.find((line) => line.productId === product._id);
  const wanted = Math.min((existing?.qty ?? 0) + qty, product.stock);
  const line = { productId: product._id, name: product.name, image: product.image, price: product.price, stock: product.stock, qty: wanted };
  write(existing ? current.map((item) => (item === existing ? line : item)) : [...current, line]);
}

export function setCartQty(productId: string, qty: number) {
  write(read().map((line) => (line.productId === productId ? { ...line, qty: Math.max(1, Math.min(qty, line.stock)) } : line)));
}

export function removeFromCart(productId: string) {
  write(read().filter((line) => line.productId !== productId));
}

export function clearCart() {
  write([]);
}

// Brings saved lines up to today's price and stock, and drops products that are gone.
// Returns true when anything changed, so the page can tell the shopper.
export async function refreshCart() {
  const current = read();
  if (current.length === 0) return false;
  const res = await fetch(`/api/products/by-ids?ids=${current.map((line) => line.productId).join(",")}`);
  if (!res.ok) return false;
  const fresh = new Map<string, Product>((await res.json()).map((product: Product) => [product._id, product]));
  let changed = false;
  const next = current.flatMap((line) => {
    const product = fresh.get(line.productId);
    if (!product) {
      changed = true;
      return [];
    }
    const qty = Math.min(line.qty, product.stock);
    if (product.price !== line.price || qty !== line.qty) changed = true;
    return [{ ...line, name: product.name, image: product.image, price: product.price, stock: product.stock, qty }];
  });
  write(next);
  return changed;
}
