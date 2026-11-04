"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { authPath } from "@/lib/client/return-path";

type AuthLinkProps = { href: "/login" | "/register"; className?: string; onClick?: () => void; children: ReactNode };

export default function AuthLink({ href, className, onClick, children }: AuthLinkProps) {
  const router = useRouter();

  function open(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.();
    // Leave new-tab clicks to the browser
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    router.push(authPath(href));
  }

  return <Link href={href} onClick={open} className={className}>{children}</Link>;
}
