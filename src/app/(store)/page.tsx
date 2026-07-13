import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { getShopSettings } from "@/lib/settings";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/store/ProductCard";
import { HeroHeadline } from "@/components/store/HeroHeadline";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

export const revalidate = 60;

const CATEGORY_IMAGES: Record<string, string> = {
  "liquid-soap": "/products/lavender-soap-1.jpg",
  perfumes: "/products/oud-perfume-2.jpg",
  smocks: "/products/smock-2.jpg",
};

const VALUES = [
  { title: "Made in Ghana", text: "Small-batch soap, fragrance and smocks from local makers." },
  { title: "Pay with MoMo", text: "MTN MoMo, Telecel Cash, AT Money or card — secured by Paystack." },
  { title: "Delivered to you", text: "Simple flat delivery by area, confirmed by SMS." },
];

export default async function HomePage() {
  const [featured, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getShopSettings(),
  ]);

  return (
    <>
      {/* ── Hero — airy editorial split ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <HeroHeadline
            title={settings.tagline}
            subtitle="Liquid soap, signature perfumes and traditional smocks — made in Ghana, delivered to your door."
          >
            <Button href="/shop" size="lg">
              Shop the collection
              <ArrowRight className="size-5" strokeWidth={1.75} />
            </Button>
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 px-2 py-4 text-base text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              Track an order
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </HeroHeadline>

          <Reveal delay={0.15} className="order-first lg:order-last">
            <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="spin-glow" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-border/60">
                <Image
                  src="/hero.jpg"
                  alt="Adepa Store craft"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 w-full">
        <Reveal className="flex items-end justify-between gap-4 flex-wrap">
          <h2 className="text-3xl sm:text-4xl">Shop by category</h2>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
          >
            View all
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </Link>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-3">
          {categories.map((cat) => (
            <StaggerItem key={cat.id}>
              <Link href={`/shop?category=${cat.slug}`} className="group block cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={CATEGORY_IMAGES[cat.slug] ?? "/hero.jpg"}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-3.5 flex items-center justify-between">
                  <span className="font-display text-xl">{cat.name}</span>
                  <ArrowUpRight
                    className="size-5 text-muted-foreground transition-all duration-300 group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* ── Featured products ── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 w-full">
          <Reveal className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Featured</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Hand-picked pieces</h2>
            </div>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-5 sm:gap-6 grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  image={p.images[0] ?? "/hero.jpg"}
                  categoryName={p.category.name}
                  stock={p.stock}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* ── Values — quiet, hairline-separated ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 w-full">
        <StaggerGrid className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {VALUES.map((v) => (
            <StaggerItem key={v.title} className="bg-background p-8">
              <p className="font-display text-xl">{v.title}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* ── Closing line ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-28 pt-4 w-full">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface px-6 py-16 sm:px-16 sm:py-20 text-center">
            <div className="spin-glow opacity-30" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl leading-tight max-w-xl mx-auto">
                Bring home the scent and craft of Ghana
              </h2>
              <div className="mt-8 flex justify-center">
                <Button href="/shop" size="lg">
                  Start shopping
                  <ArrowRight className="size-5" strokeWidth={1.75} />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
