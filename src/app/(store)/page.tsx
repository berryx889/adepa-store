import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Sparkles, Truck } from "lucide-react";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { getShopSettings } from "@/lib/settings";
import { formatGHS } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/store/ProductCard";
import { HeroHeadline } from "@/components/store/HeroHeadline";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";
import { ParallaxLayer, ParallaxFadeUp } from "@/components/motion/Parallax";

export const revalidate = 60;

const CATEGORY_IMAGES: Record<string, string> = {
  "liquid-soap": "/products/lavender-soap-1.jpg",
  perfumes: "/products/oud-perfume-2.jpg",
  smocks: "/products/smock-2.jpg",
};

const MARQUEE = [
  "Handmade in Ghana",
  "Pay with MoMo",
  "Delivered nationwide",
  "Small-batch fragrance",
  "Handwoven smocks",
  "Confirmed by SMS",
];

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: "Pay with MoMo or card",
    text: "Secure checkout by Paystack — MTN MoMo, Telecel Cash, AT Money and cards.",
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

  const bento = featured.slice(0, 5);

  return (
    <>
      {/* ── Hero — parallax imagery + animated headline ── */}
      <section className="relative min-h-[94svh] flex items-center bg-primary overflow-hidden grain">
        <ParallaxLayer className="absolute inset-0" distance={140} scale={1.1}>
          <div className="relative w-full h-full">
            <Image
              src="/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80 animate-ken-burns"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
            {/* terracotta glow */}
            <div className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-terracotta/25 blur-[120px]" />
          </div>
        </ParallaxLayer>

        <ParallaxFadeUp className="relative mx-auto max-w-6xl px-4 sm:px-6 w-full pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-on-primary/20 bg-on-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-on-primary/80 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-terracotta" strokeWidth={2} />
            Authentic Ghanaian craft
          </span>
          <HeroHeadline
            title={settings.tagline}
            subtitle="Liquid soap, signature perfumes and traditional smocks — made in Ghana, delivered to your door."
          >
            <Button href="/shop" size="lg">
              Shop the collection
              <ArrowRight className="size-5" strokeWidth={2} />
            </Button>
            <Button
              href="/track"
              size="lg"
              className="bg-transparent text-on-primary border-2 border-on-primary/30 shadow-none hover:bg-on-primary/10 hover:border-on-primary"
            >
              Track order
            </Button>
          </HeroHeadline>
        </ParallaxFadeUp>
      </section>

      {/* ── Marquee strip ── */}
      <div className="bg-terracotta text-on-primary py-3 overflow-hidden border-y border-terracotta-deep/30">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {MARQUEE.map((item) => (
                <span key={item} className="flex items-center whitespace-nowrap">
                  <span className="px-6 text-sm font-medium tracking-wide">{item}</span>
                  <span className="size-1.5 rounded-full bg-on-primary/50" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 w-full">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-terracotta">
            Explore
          </p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-semibold max-w-xl">
            Shop by category
          </h2>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <StaggerItem key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <Image
                  src={CATEGORY_IMAGES[cat.slug] ?? "/hero.jpg"}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
                  <span className="font-display text-2xl font-semibold text-on-primary">
                    {cat.name}
                  </span>
                  <span className="size-10 rounded-full bg-on-primary/15 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:scale-110">
                    <ArrowUpRight className="size-4 text-on-primary" strokeWidth={2.25} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* ── Featured — bento grid ── */}
      {bento.length >= 3 && (
        <section className="bg-surface border-y border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 w-full">
            <Reveal className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-terracotta">
                  Featured
                </p>
                <h2 className="mt-2 text-3xl sm:text-5xl font-semibold">
                  Hand-picked pieces
                </h2>
              </div>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-3 transition-all duration-300 cursor-pointer"
              >
                View all
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
            </Reveal>

            <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(0,1fr)]">
              {/* Large feature tile */}
              <StaggerItem className="sm:col-span-2 lg:row-span-2">
                <Link
                  href={`/product/${bento[0].slug}`}
                  className="group relative flex h-full min-h-80 flex-col justify-end rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <Image
                    src={bento[0].images[0] ?? "/hero.jpg"}
                    alt={bento[0].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                  <div className="relative p-6">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-on-primary/70">
                      {bento[0].category.name}
                    </p>
                    <h3 className="mt-1 font-display text-3xl font-semibold text-on-primary">
                      {bento[0].name}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-2 text-on-primary font-semibold">
                      {formatGHS(bento[0].price)}
                      <span className="size-8 rounded-full bg-accent flex items-center justify-center">
                        <ArrowUpRight className="size-4 text-on-primary" strokeWidth={2.25} />
                      </span>
                    </p>
                  </div>
                </Link>
              </StaggerItem>

              {bento.slice(1).map((p) => (
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
      )}

      {/* ── Trust strip ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 w-full">
        <StaggerGrid className="grid gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <StaggerItem
              key={point.title}
              className="rounded-2xl bg-surface p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <span className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <point.icon className="size-6 text-accent" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 font-sans text-base font-semibold">{point.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{point.text}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* ── Closing CTA ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 w-full">
        <Reveal>
          <div className="relative overflow-hidden rounded-[34px] bg-primary px-6 py-16 sm:px-16 sm:py-20 text-center grain">
            <div className="absolute -left-32 -top-24 size-[420px] rounded-full bg-terracotta/25 blur-[120px]" />
            <div className="absolute -right-24 -bottom-24 size-[380px] rounded-full bg-accent/20 blur-[120px]" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-semibold text-on-primary max-w-2xl mx-auto leading-tight">
                Bring home the scent and craft of Ghana
              </h2>
              <p className="mt-4 text-on-primary/70 max-w-md mx-auto">
                Free browsing, easy MoMo checkout, delivered to your door.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/shop" size="lg">
                  Start shopping
                  <ArrowRight className="size-5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
