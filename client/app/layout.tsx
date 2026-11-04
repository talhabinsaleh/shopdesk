import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono, Sora } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: { default: "ShopDesk | Online shop", template: "%s | ShopDesk" },
  description: "Browse home appliances, wardrobes, office equipment, automobiles and phones. Order easily, pay online or on delivery, and exchange within 7 days.",
};

// Runs before the first paint, so a saved theme never flashes
const themeScript = `(function(){try{var t=localStorage.getItem('shopdesk-theme');if(t!=='shopdesk-light'&&t!=='shopdesk-dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'shopdesk-dark':'shopdesk-light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','shopdesk-light')}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="shopdesk-light" suppressHydrationWarning className={`${sora.variable} ${figtree.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh font-sans text-base-content antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
