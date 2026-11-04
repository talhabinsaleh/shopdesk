"use client";

import { ClipboardList, FolderTree, LayoutDashboard, Menu, Package, Store, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import AccountMenu from "@/components/client/AccountMenu";
import Logo from "@/components/client/Logo";
import ThemeToggle from "@/components/client/ThemeToggle";

const NAV = [
  { href: "/manage", label: "Overview", icon: LayoutDashboard },
  { href: "/manage/orders", label: "Orders", icon: ClipboardList },
  { href: "/manage/products", label: "Products", icon: Package },
  { href: "/manage/categories", label: "Categories", icon: FolderTree },
  { href: "/manage/customers", label: "Customers", icon: Users },
];

export default function ManageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/manage" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? "page" : undefined} className={`flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium transition-colors ${isActive(href) ? "bg-primary text-primary-content" : "hover:bg-base-300"}`}>
            <Icon className="size-4" /> {label}
          </Link>
        </li>
      ))}
      <li className="mt-3 border-t border-base-300 pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium hover:bg-base-300"><Store className="size-4" /> View shop</Link>
      </li>
    </ul>
  );

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="no-print sticky top-0 hidden h-svh flex-col border-r border-base-300 bg-base-200 p-4 lg:flex">
        <Logo />
        <span className="mt-1 text-xs text-base-content/60">Admin</span>
        <nav className="mt-5 overflow-y-auto" aria-label="Dashboard">{nav}</nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-base-300 bg-base-100/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:invisible">
            <button type="button" className="btn btn-ghost btn-square btn-sm" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-2"><ThemeToggle /><AccountMenu /></div>
        </header>
        {open && <nav className="no-print border-b border-base-300 bg-base-200 p-3 lg:hidden" aria-label="Dashboard">{nav}</nav>}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
