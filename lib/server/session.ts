import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/server/auth";

export const getUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
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
