import type { ReactNode } from "react";
import Footer from "@/components/server/Footer";
import Navbar from "@/components/client/Navbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
