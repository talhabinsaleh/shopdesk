import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getUser } from "@/lib/session";
import { safeRedirect } from "@/lib/validation";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const params = await searchParams;
  const target = safeRedirect(params.redirect);
  if (await getUser()) redirect(target);
  const googleError = params.error ? "Google sign in did not finish. Please try again, or log in with your email and password." : "";
  return <LoginForm redirectTo={target} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} initialError={googleError} />;
}
