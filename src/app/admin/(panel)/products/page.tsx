import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Package, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { formatGHS } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-semibold">Products</h1>
        <Button href="/admin/products/new" size="sm">
          <Plus className="size-4" strokeWidth={2} />
          Add product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center py-12">
          <span className="size-16 rounded-full bg-muted flex items-center justify-center">
            <Package className="size-7 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-muted-foreground">No products yet. Add your first one.</p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-white shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 pl-4 pr-4 font-semibold">Product</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold">Price</th>
                  <th className="py-3 pr-4 font-semibold">Stock</th>
                  <th className="py-3 pr-4 font-semibold">Variants</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 pl-4 pr-4">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <span className="relative size-10 rounded-md overflow-hidden shrink-0 bg-muted">
                          {p.images[0] && (
                            <Image
                              src={p.images[0]}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <span className="font-medium group-hover:text-accent transition-colors">
                          {p.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{p.category.name}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{formatGHS(p.price)}</td>
                    <td
                      className={cn(
                        "py-2.5 pr-4 tabular-nums font-medium",
                        p.stock === 0
                          ? "text-destructive"
                          : p.stock <= 5
                            ? "text-accent"
                            : undefined
                      )}
                    >
                      {p.stock}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {p.variants.length > 0 ? p.variants.map((v) => v.name).join(", ") : "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          p.isActive
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <DeleteProductButton productId={p.id} name={p.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
