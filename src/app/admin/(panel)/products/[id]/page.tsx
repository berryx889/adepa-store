import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">Edit product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          description: product.description,
          images: product.images,
          stock: product.stock,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            stockOverride: v.stockOverride,
          })),
        }}
      />
    </div>
  );
}
