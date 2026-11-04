import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center px-4 text-center">
      <div>
        <p className="figure text-5xl font-semibold text-primary">404</p>
        <h1 className="section-title mt-3">This aisle does not exist.</h1>
        <p className="section-text mx-auto">The page may have moved, or the link may be wrong.</p>
        <Link href="/" className="btn btn-primary mt-6">Back to the shop</Link>
      </div>
    </div>
  );
}
