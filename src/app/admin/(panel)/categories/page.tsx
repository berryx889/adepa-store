import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">Categories</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        New categories appear in the shop filter automatically — no code changes needed.
      </p>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
