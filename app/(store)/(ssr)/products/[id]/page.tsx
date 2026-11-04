import { ChevronLeft, Repeat, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyBox from "@/components/client/BuyBox";
import ProductCard from "@/components/server/ProductCard";
import ProductGallery from "@/components/client/ProductGallery";
import { money } from "@/lib/shared/format";
import { getProduct, getProducts } from "@/lib/server/page-data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product?.name ?? "Product not found", description: product?.description };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const related = await getProducts(`category=${encodeURIComponent(product.category)}&limit=5`);
  const others = related.items.filter((item) => item._id !== id).slice(0, 4);

  return (
    <div className="page-shell py-6 sm:py-10">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-base-content/70 hover:text-primary"><ChevronLeft className="size-4" /> Back to shop</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ProductGallery name={product.name} photos={[product.image, ...product.gallery]} />
        <div>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-sm font-medium text-primary hover:underline">{product.category}</Link>
          <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1>
          <p className="figure mt-5 text-3xl font-semibold">{money(product.price)}</p>
          <p className={`mt-2 text-sm font-medium ${product.stock === 0 ? "text-error" : "text-success"}`}>{product.stock === 0 ? "Sold out" : `${product.stock} in stock`}</p>
          <p className="mt-5 leading-relaxed text-base-content/80">{product.description}</p>
          <div className="mt-6"><BuyBox product={product} /></div>
          <ul className="mt-6 space-y-2 rounded-field bg-base-200 p-3 text-sm text-base-content/75">
            <li className="flex items-start gap-2"><Smartphone className="mt-0.5 size-4 shrink-0 text-primary" /> Pay with bKash, Nagad or cash on delivery.</li>
            <li className="flex items-start gap-2"><Repeat className="mt-0.5 size-4 shrink-0 text-primary" /> Exchange within 7 days of delivery.</li>
          </ul>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-12 border-t border-base-300 pt-8">
          <h2 className="text-2xl font-bold">More from {product.category}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {others.map((item) => <ProductCard key={item._id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
