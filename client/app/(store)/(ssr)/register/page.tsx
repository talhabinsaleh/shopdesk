import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";
import { getSettings } from "@/lib/server-api";
import { getUser } from "@/lib/session";
import { safeRedirect } from "@/lib/validation";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const target = safeRedirect((await searchParams).redirect);
  if (await getUser()) redirect(target);
  return <RegisterForm redirectTo={target} googleEnabled={(await getSettings()).googleLogin} />;
}
