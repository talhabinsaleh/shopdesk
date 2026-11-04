import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/client/RegisterForm";
import { getUser } from "@/lib/server/session";
import { safeRedirect } from "@/lib/shared/validation";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const target = safeRedirect((await searchParams).redirect);
  if (await getUser()) redirect(target);
  return <RegisterForm redirectTo={target} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />;
}
