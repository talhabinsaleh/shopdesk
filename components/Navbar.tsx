"use client";

import { Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/lib/cart";
import AccountMenu from "./AccountMenu";
import AuthLink from "./AuthLink";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/orders", label: "My Orders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const cart = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="no-print sticky top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <nav className="page-shell flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={`block rounded-field px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : ""}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* useSearchParams needs a Suspense boundary so pages can still be prerendered */}
        <Suspense><SearchBar className="hidden max-w-md flex-1 lg:block" /></Suspense>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/cart" className="btn btn-ghost btn-square btn-sm relative" aria-label={`Cart, ${count} items`}>
            <ShoppingCart className="size-5" />
            {count > 0 && <span className="figure absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-content">{count}</span>}
          </Link>
          {isPending ? (
            <span className="skeleton size-9 rounded-full" aria-label="Loading account" />
          ) : session ? (
            <AccountMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <AuthLink href="/login" className="btn btn-ghost btn-sm">Login</AuthLink>
              <AuthLink href="/register" className="btn btn-primary btn-sm">Register</AuthLink>
            </div>
          )}
          <button type="button" className="btn btn-ghost btn-square btn-sm md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <div className="page-shell pb-3 lg:hidden">
        <Suspense><SearchBar onDone={() => setMobileOpen(false)} /></Suspense>
      </div>

      {mobileOpen && (
        <div className="border-t border-base-300 bg-base-100 md:hidden">
          <ul className="page-shell py-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMobileOpen(false)} className={`block rounded-field px-3 py-2.5 font-medium ${isActive(link.href) ? "bg-base-200 text-primary" : ""}`}>{link.label}</Link>
              </li>
            ))}
            {!session && !isPending && (
              <li className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                <AuthLink href="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline btn-sm">Login</AuthLink>
                <AuthLink href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm">Register</AuthLink>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
