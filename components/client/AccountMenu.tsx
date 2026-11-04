"use client";

import { LayoutDashboard, LogOut, PackageSearch, Store } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/client/auth-client";
import Avatar from "@/components/client/Avatar";

const PRIVATE_PAGES = ["/checkout", "/orders", "/manage"];

export default function AccountMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = session?.user;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;
  const canManage = user.role === "admin";

  async function logout() {
    setOpen(false);
    await signOut();
    toast.success("You have logged out.");
    // Public pages stay open after logout. Private pages need a login, so those go home.
    if (PRIVATE_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`))) router.push("/");
    router.refresh();
  }

  const item = "flex items-center gap-3 rounded-field px-3 py-2 text-sm hover:bg-base-300";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open account menu" className="block rounded-full ring-2 ring-transparent transition hover:ring-primary">
        <Avatar name={user.name} src={user.image} className="size-9 text-xs" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 w-60 pt-2">
          <div className="rounded-box border border-base-300 bg-base-200 p-2 shadow-xl">
            <div className="border-b border-base-300 px-3 pb-3 pt-2">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-xs text-base-content/65">{user.email}</p>
            </div>
            <ul className="mt-1">
              {canManage && (
                <li><Link href="/manage" onClick={() => setOpen(false)} className={item}><LayoutDashboard className="size-4" /> Dashboard</Link></li>
              )}
              <li><Link href="/products" onClick={() => setOpen(false)} className={item}><Store className="size-4" /> Shop</Link></li>
              <li><Link href="/orders" onClick={() => setOpen(false)} className={item}><PackageSearch className="size-4" /> My Orders</Link></li>
              <li>
                <button type="button" onClick={logout} className={`${item} w-full text-error`}><LogOut className="size-4" /> Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
