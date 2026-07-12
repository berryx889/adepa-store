import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">New product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={null}
      />
    </div>
  );
}
