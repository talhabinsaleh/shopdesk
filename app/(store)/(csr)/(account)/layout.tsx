import type { ReactNode } from "react";
import { requireUser } from "@/lib/server/session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return children;
}
