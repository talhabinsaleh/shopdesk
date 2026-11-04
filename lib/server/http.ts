import "server-only";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Params = Record<string, string>;
type Handler = (request: Request, params: Params) => Promise<unknown>;

// Wraps an API route: returns its result as JSON and turns thrown errors into a clear message
export function route(handler: Handler) {
  return async (request: Request, context: { params: Promise<Params> }) => {
    try {
      const result = await handler(request, await context.params);
      return result instanceof Response ? result : NextResponse.json(result);
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ message: err.message }, { status: err.status });
      if (typeof err === "object" && err && (err as { code?: number }).code === 11000) {
        return NextResponse.json({ message: "That value is already in use." }, { status: 409 });
      }
      console.error(err);
      return NextResponse.json({ message: "Something went wrong on the server." }, { status: 500 });
    }
  };
}

export function created(data: unknown) {
  return NextResponse.json(data, { status: 201 });
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" ? body : {};
}

export function query(request: Request) {
  return new URL(request.url).searchParams;
}

// API routes check the same BetterAuth login the pages use
export async function apiUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new HttpError(401, "Unauthorized: please log in first.");
  return session.user;
}

export async function apiAdmin() {
  const user = await apiUser();
  if (user.role !== "admin") throw new HttpError(403, "You do not have access to this.");
  return user;
}

export function asObjectId(value: unknown): ObjectId {
  if (typeof value !== "string" || !ObjectId.isValid(value)) throw new HttpError(404, "Not found.");
  return new ObjectId(value);
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function text(value: unknown, label: string, { min = 1, max = 200 } = {}): string {
  const clean = typeof value === "string" ? value.trim() : "";
  if (clean.length < min) throw new HttpError(400, `${label} is required.`);
  if (clean.length > max) throw new HttpError(400, `${label} must be ${max} characters or fewer.`);
  return clean;
}

export function optionalText(value: unknown, label: string, max = 200): string {
  return text(value ?? "", label, { min: 0, max });
}

export function number(value: unknown, label: string, { min = 0, max = 100_000_000, integer = false } = {}): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new HttpError(400, `${label} must be a number from ${min} to ${max}.`);
  }
  if (integer && !Number.isInteger(parsed)) throw new HttpError(400, `${label} must be a whole number.`);
  return parsed;
}

// Allows http(s) links and this site's own files, so a stored image can never be a javascript: URL
export function imageUrl(value: unknown): string {
  const clean = typeof value === "string" ? value.trim() : "";
  if (/^\/[\w./-]+$/.test(clean)) return clean;
  try {
    const url = new URL(clean);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    // Reported below
  }
  throw new HttpError(400, "Please add a valid image.");
}

// Dates are chosen in Bangladesh time, so a day starts at midnight there
export const TIME_ZONE = "Asia/Dhaka";

export function dayStart(day: string): Date {
  return new Date(`${day}T00:00:00+06:00`);
}

export function paging(params: URLSearchParams, fallback = 12) {
  const page = Math.max(1, Math.floor(Number(params.get("page"))) || 1);
  const limit = Math.min(100, Math.max(1, Math.floor(Number(params.get("limit"))) || fallback));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageOf<T>(items: T[], total: number, page: number, limit: number) {
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}
