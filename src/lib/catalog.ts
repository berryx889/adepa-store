import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 12;

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export type ShopFilters = {
  category?: string;
  q?: string;
  sort?: "price-asc" | "price-desc" | "newest";
  page?: number;
};

export async function getProducts({ category, q, sort = "newest", page = 1 }: ShopFilters) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
}
