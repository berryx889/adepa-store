import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, PackageOpen, Search } from "lucide-react";
import { getCategories, getProducts, type ShopFilters } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { StaggerGrid, StaggerItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { SortSelect } from "@/components/store/SortSelect";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 60;

function shopUrl(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `/shop?${s}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const filters: ShopFilters = {
    category: sp.category,
    q: sp.q,
    sort: (["price-asc", "price-desc", "newest"].includes(sp.sort ?? "")
      ? sp.sort
      : "newest") as ShopFilters["sort"],
    page: Math.max(1, parseInt(sp.page ?? "1", 10) || 1),
  };

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);
  const page = filters.page!;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-24 pb-16 sm:pb-20">
      <h1 className="text-4xl sm:text-5xl font-semibold">Shop</h1>
      <p className="mt-2 text-muted-foreground">
        {total} product{total === 1 ? "" : "s"}
        {filters.q ? ` matching “${filters.q}”` : ""}
      </p>

      {/* Search + sort */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <form action="/shop" className="relative flex-1 max-w-sm" role="search">
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            strokeWidth={1.75}
          />
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <input
            id="shop-search"
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search products…"
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
        </form>
        <SortSelect
          current={filters.sort!}
          category={filters.category}
          q={filters.q}
        />
      </div>

      {/* Category filter pills */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Link
          href={shopUrl({ q: filters.q, sort: sp.sort })}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium border transition-colors duration-200 cursor-pointer",
            !filters.category
              ? "bg-primary text-on-primary border-primary"
              : "border-border bg-white hover:border-primary"
          )}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={shopUrl({ category: cat.slug, q: filters.q, sort: sp.sort })}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium border transition-colors duration-200 cursor-pointer",
              filters.category === cat.slug
                ? "bg-primary text-on-primary border-primary"
                : "border-border bg-white hover:border-primary"
            )}
            aria-current={filters.category === cat.slug ? "true" : undefined}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center py-12">
          <span className="size-16 rounded-full bg-muted flex items-center justify-center">
            <PackageOpen className="size-7 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <div>
            <p className="font-display text-xl font-semibold">Nothing found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or category.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-accent hover:underline cursor-pointer"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <StaggerGrid className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
          <Link
            href={shopUrl({ ...sp, page: String(page - 1) })}
            aria-disabled={page <= 1}
            className={cn(
              "p-2.5 rounded-lg border border-border bg-white transition-colors duration-200",
              page <= 1
                ? "opacity-40 pointer-events-none"
                : "hover:border-primary cursor-pointer"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={shopUrl({ ...sp, page: String(n) })}
              className={cn(
                "min-w-10 text-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer tabular-nums",
                n === page
                  ? "bg-primary text-on-primary border-primary"
                  : "border-border bg-white hover:border-primary"
              )}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </Link>
          ))}
          <Link
            href={shopUrl({ ...sp, page: String(page + 1) })}
            aria-disabled={page >= totalPages}
            className={cn(
              "p-2.5 rounded-lg border border-border bg-white transition-colors duration-200",
              page >= totalPages
                ? "opacity-40 pointer-events-none"
                : "hover:border-primary cursor-pointer"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
        </nav>
      )}
    </div>
  );
}
