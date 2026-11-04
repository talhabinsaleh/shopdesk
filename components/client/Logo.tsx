"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

// The logo always leads to the shop's home page, from any page including the admin area.
// Next.js keeps the scroll position when the link points at the current page, so on the
// home page itself the click scrolls back to the top instead.
export default function Logo() {
  const pathname = usePathname();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2 font-display text-lg font-bold tracking-tight" aria-label="ShopDesk home">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
        <path d="M9 8h14v16l-2.300-1.600L18.300 24 16 22.400 13.700 24l-2.400-1.600L9 24z" fill="var(--color-primary-content)" />
        <path d="M12.500 12.500h7M12.500 16.500h7" stroke="var(--color-primary)" strokeWidth="1.800" strokeLinecap="round" />
      </svg>
      ShopDesk
    </Link>
  );
}
