import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import ManageShell from "@/components/manage/ManageShell";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ManageLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return <ManageShell>{children}</ManageShell>;
}
