import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/catalog";
import { formatGHS } from "@/lib/money";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCart } from "@/components/store/AddToCart";
import { Reveal } from "@/components/motion/Reveal";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-24 pb-16 sm:pb-20">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-accent transition-colors cursor-pointer">
          Shop
        </Link>
        <ChevronRight className="size-3.5" strokeWidth={2} />
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-3.5" strokeWidth={2} />
        <span className="text-foreground truncate max-w-40 sm:max-w-none">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:gap-14 lg:grid-cols-2">
        <Reveal>
          <ProductGallery images={product.images} name={product.name} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-semibold leading-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-accent tabular-nums">
            {formatGHS(product.price)}
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-prose">
            {product.description}
          </p>

          <AddToCart
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={product.images[0] ?? "/hero.jpg"}
            stock={product.stock}
            variants={product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              stockOverride: v.stockOverride,
            }))}
          />
        </Reveal>
      </div>
    </div>
  );
}
