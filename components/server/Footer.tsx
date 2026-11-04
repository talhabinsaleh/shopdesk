import Link from "next/link";
import Logo from "@/components/client/Logo";

export default function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-base-300 bg-base-200">
      <div className="page-shell grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-base-content/70">Home appliances, wardrobes, office equipment, automobiles and phones, all in one online catalog.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-base-content/70">
            <li><Link href="/products" className="hover:text-primary">All products</Link></li>
            <li><Link href="/cart" className="hover:text-primary">Cart</Link></li>
            <li><Link href="/orders" className="hover:text-primary">Track my orders</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Payment and exchange</h2>
          <ul className="mt-3 space-y-2 text-sm text-base-content/70">
            <li>bKash, Nagad or cash on delivery</li>
            <li>Exchange within 7 days of delivery</li>
            <li>Free delivery from ৳5,000</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-base-300 py-4 text-center text-xs text-base-content/60">© {new Date().getFullYear()} ShopDesk. Demo project with sample data.</p>
    </footer>
  );
}
