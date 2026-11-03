import { ArrowRight, Repeat, Smartphone, Truck } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getFeatured } from "@/lib/server-api";

const PROMISES = [
  { icon: Smartphone, title: "Pay your way", text: "Pay with bKash or Nagad when you order, or in cash when it arrives." },
  { icon: Truck, title: "Simple delivery", text: "A flat ৳80 anywhere in Bangladesh, and free once your order reaches ৳5,000." },
  { icon: Repeat, title: "Easy exchange", text: "Not right? Ask for an exchange from My Orders within 7 days of delivery." },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeatured()]);

  return (
    <>
      <section className="border-b border-base-300 bg-base-200">
        <div className="page-shell grid items-center gap-8 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-14">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">From a shirt to a scooter, all in one shop.</h1>
            <p className="section-text text-lg">Pick a category, choose what you like and order in a few clicks.</p>
            <Link href="/products" className="btn btn-primary mt-7">Browse the shop <ArrowRight className="size-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["scooter", "check-shirt", "oppo", "microwave"].map((name) => (
              <div key={name} className="aspect-[4/3] rounded-box border border-base-300 bg-[#fbfaf5] p-3 sm:p-4">
                <img src={`/products/${name}-1.webp`} alt="" className="size-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-gap">
        <h2 className="section-title">Shop by category</h2>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <li key={category._id}>
              <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="group block h-full overflow-hidden rounded-box border border-base-300 transition-colors hover:border-primary/50">
                <div className="product-tile aspect-[4/3] p-3">
                  <img src={category.image} alt="" loading="lazy" className="size-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-xs text-base-content/65">{category.productCount} products</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-shell pb-[clamp(3rem,2.5rem+3vw,5.5rem)]">
        <div className="flex items-end justify-between gap-4">
          <h2 className="section-title">Featured products</h2>
          <Link href="/products" className="link link-primary shrink-0 text-sm font-medium">See everything</Link>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <section className="border-t border-base-300 bg-base-200">
        <ul className="page-shell grid gap-6 py-10 sm:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon className="size-6 text-primary" />
              <h2 className="mt-3 font-sans text-base font-semibold tracking-normal">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-base-content/70">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
