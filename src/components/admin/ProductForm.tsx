"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { cn } from "@/lib/cn";

type Category = { id: string; name: string };
type VariantRow = { id?: string; name: string; stockOverride: string };

type Initial = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  variants: Array<{ id: string; name: string; stockOverride: number | null }>;
} | null;

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial: Initial;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    categoryId: initial?.categoryId ?? (categories[0]?.id ?? ""),
    priceCedis: initial ? (initial.price / 100).toFixed(2) : "",
    description: initial?.description ?? "",
    stock: initial != null ? String(initial.stock) : "0",
    isActive: initial?.isActive ?? true,
    isFeatured: initial?.isFeatured ?? false,
  });
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({
      id: v.id,
      name: v.name,
      stockOverride: v.stockOverride == null ? "" : String(v.stockOverride),
    })) ?? []
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCedis = parseFloat(form.priceCedis);
    if (Number.isNaN(priceCedis) || priceCedis <= 0) {
      setError("Enter a valid price in GHS");
      return;
    }
    const stock = parseInt(form.stock, 10);
    if (Number.isNaN(stock) || stock < 0) {
      setError("Enter a valid stock quantity");
      return;
    }
    if (form.name.trim().length < 2) {
      setError("Enter a product name");
      return;
    }
    if (!form.description.trim()) {
      setError("Enter a description");
      return;
    }

    const input: ProductInput = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Math.round(priceCedis * 100),
      description: form.description.trim(),
      images,
      stock,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      variants: variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          id: v.id,
          name: v.name.trim(),
          stockOverride: v.stockOverride === "" ? null : parseInt(v.stockOverride, 10) || 0,
        })),
    };

    startTransition(async () => {
      const result = await saveProduct(initial?.id ?? null, input);
      // On success the action redirects; we only land here on error.
      if (result && !result.ok) setError(result.error ?? "Could not save");
    });
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10";

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5" noValidate>
      <div>
        <label htmlFor="p-name" className="block text-sm font-semibold mb-1.5">
          Name
        </label>
        <input
          id="p-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-category" className="block text-sm font-semibold mb-1.5">
            Category
          </label>
          <select
            id="p-category"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className={cn(inputCls, "cursor-pointer")}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-price" className="block text-sm font-semibold mb-1.5">
            Price (GH₵)
          </label>
          <input
            id="p-price"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={form.priceCedis}
            onChange={(e) => setForm((f) => ({ ...f, priceCedis: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="p-desc" className="block text-sm font-semibold mb-1.5">
          Description
        </label>
        <textarea
          id="p-desc"
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-1.5">Photos</p>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-stock" className="block text-sm font-semibold mb-1.5">
            Stock quantity
          </label>
          <input
            id="p-stock"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div className="flex items-end gap-6 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="size-4 accent-[#A16207] cursor-pointer"
            />
            Active
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="size-4 accent-[#A16207] cursor-pointer"
            />
            Featured on home
          </label>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold mb-1.5">
          Variants <span className="font-normal text-muted-foreground">(sizes, volumes — optional)</span>
        </legend>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className="flex gap-2 items-center">
              <input
                value={v.name}
                onChange={(e) =>
                  setVariants((list) =>
                    list.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row))
                  )
                }
                placeholder='e.g. "Size L" or "500ml"'
                aria-label={`Variant ${i + 1} name`}
                className={cn(inputCls, "flex-1")}
              />
              <input
                value={v.stockOverride}
                onChange={(e) =>
                  setVariants((list) =>
                    list.map((row, idx) =>
                      idx === i ? { ...row, stockOverride: e.target.value } : row
                    )
                  )
                }
                type="number"
                min="0"
                placeholder="Stock (opt.)"
                aria-label={`Variant ${i + 1} stock override`}
                className={cn(inputCls, "w-32")}
              />
              <button
                type="button"
                onClick={() => setVariants((list) => list.filter((_, idx) => idx !== i))}
                className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer transition-colors"
                aria-label={`Remove variant ${i + 1}`}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVariants((list) => [...list, { name: "", stockOverride: "" }])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2} />
          Add variant
        </button>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-on-primary px-6 py-3 font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-h-11"
        >
          {pending && <Loader2 className="size-4 animate-spin" strokeWidth={2} />}
          {pending ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
