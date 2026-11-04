export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

// Browser calls to this site's own /api routes, which read the login cookie on the server
export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message ?? "Something went wrong. Please try again.", res.status);
  return data as T;
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}
