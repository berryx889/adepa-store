import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Truck } from "lucide-react";
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

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: "Pay with MoMo or card",
    text: "Secure checkout powered by Paystack. MTN MoMo, Telecel Cash, AT Money and cards.",
  },
  {
    icon: Truck,
    title: "Delivery across Ghana",
    text: "Flat fees by area, confirmed by SMS. Accra, Tema and beyond.",
  },
  {
    icon: Sparkles,
    title: "Handmade quality",
    text: "Small-batch soap, lasting fragrance and smocks woven by masters in Tamale.",
  },
];

export default async function HomePage() {
  const [featured, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getShopSettings(),
  ]);

  return (
    <>
      {/* Hero — full-bleed, slow ken-burns imagery, animated headline */}
      <section className="relative min-h-[92svh] flex items-center bg-primary overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90 animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/20" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 w-full pt-16">
          <HeroHeadline
            title={settings.tagline}
            subtitle="Liquid soap, signature perfumes and traditional smocks — made in Ghana, delivered to your door."
          >
            <Button href="/shop" size="lg">
              Shop now
              <ArrowRight className="size-5" strokeWidth={2} />
            </Button>
            <Button
              href="/track"
              size="lg"
              className="bg-transparent text-on-primary border-2 border-on-primary/40 shadow-none hover:bg-on-primary/10 hover:border-on-primary"
            >
              Track order
            </Button>
          </HeroHeadline>
        </div>
      </section>

      {/* Category links */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 w-full">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-semibold">Shop by category</h2>
        </Reveal>
        <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <StaggerItem key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <Image
                  src={CATEGORY_IMAGES[cat.slug] ?? "/hero.jpg"}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 flex items-center justify-between">
                  <span className="font-display text-2xl font-semibold text-on-primary">
                    {cat.name}
                  </span>
                  <span className="size-9 rounded-full bg-on-primary/15 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group-hover:bg-accent">
                    <ArrowRight className="size-4 text-on-primary" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* Featured products */}
      <section className="bg-white border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 w-full">
          <Reveal className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold">Featured pieces</h2>
              <p className="mt-2 text-muted-foreground">
                Hand-picked favourites from the workshop.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all duration-200 cursor-pointer"
            >
              View all
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </Reveal>
          <StaggerGrid className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
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
        </div>
      </section>

      {/* Social-proof / trust strip */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 w-full">
        <StaggerGrid className="grid gap-8 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <StaggerItem key={point.title} className="flex gap-4">
              <span className="size-11 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center">
                <point.icon className="size-5 text-accent" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-sans text-base font-semibold">{point.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{point.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>
    </>
  );
}
