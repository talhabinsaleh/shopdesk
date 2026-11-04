import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fromApi } from "@/lib/server-api";
import type { SessionUser } from "@/lib/types";

// Asks the API's BetterAuth who owns the login cookie. Cached, so one page asks only once.
export const getUser = cache(async () => {
  const session = await fromApi<{ user: SessionUser } | null>("/api/auth/get-session", { withLogin: true });
  return session?.user ?? null;
});

// The proxy passes the page address, so a login that has expired still returns to the same page
export async function requireUser() {
  const user = await getUser();
  if (!user) {
    const page = (await headers()).get("x-return-to") ?? "/";
    redirect(`/login?redirect=${encodeURIComponent(page)}`);
  }
  return user;
}
