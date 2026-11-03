import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getUser } from "@/lib/session";
import { safeRedirect } from "@/lib/validation";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const target = safeRedirect((await searchParams).redirect);
  if (await getUser()) redirect(target);
  return <LoginForm redirectTo={target} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />;
}
