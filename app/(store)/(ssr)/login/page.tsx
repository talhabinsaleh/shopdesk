import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/client/LoginForm";
import { getUser } from "@/lib/server/session";
import { safeRedirect } from "@/lib/shared/validation";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const params = await searchParams;
  const target = safeRedirect(params.redirect);
  if (await getUser()) redirect(target);
  const googleError = !params.error
    ? ""
    : params.error === "account_not_linked"
      // Google only joins an account whose email is confirmed, so nobody can claim someone else's address
      ? "This email already has a ShopDesk account made with a password. Please log in with your email and password."
      : "Google sign in did not finish. Please try again, or log in with your email and password.";
  return <LoginForm redirectTo={target} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} initialError={googleError} />;
}
