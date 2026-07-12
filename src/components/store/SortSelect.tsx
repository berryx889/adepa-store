"use client";

import { useRouter } from "next/navigation";

export function SortSelect({
  current,
  category,
  q,
}: {
  current: string;
  category?: string;
  q?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-muted-foreground whitespace-nowrap">
        Sort by
      </label>
      <select
        id="sort"
        value={current}
        onChange={(e) => {
          const qs = new URLSearchParams();
          if (category) qs.set("category", category);
          if (q) qs.set("q", q);
          if (e.target.value !== "newest") qs.set("sort", e.target.value);
          router.push(`/shop${qs.toString() ? `?${qs.toString()}` : ""}`);
        }}
        className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors duration-200 focus:border-primary focus:outline-none"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}
