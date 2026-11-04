import { ObjectId } from "mongodb";

// Thrown anywhere in a route; the error middleware turns it into { message } with this status
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function passwordProblem(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must have an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must have a lowercase letter.";
  return null;
}

// Request bodies are parsed JSON, so anything that is not an object becomes {}
export function body(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

// Express query values can be strings, arrays or objects. This keeps only plain strings.
export function queryParams(query: Record<string, unknown>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (typeof value === "string") params.set(key, value);
  return params;
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
