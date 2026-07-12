"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { markOrderPaid } from "@/lib/orders";
import { paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { notifyOrderPaid, notifyStatusChange } from "@/lib/sms";
import { normalizeGhanaPhone } from "@/lib/phone";

export type ActionResult = { ok: boolean; error?: string };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ---------------- Products ---------------- */

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.number().int().min(1, "Price must be at least 1 pesewa"),
  description: z.string().trim().min(1).max(5000),
  images: z.array(z.string().min(1)).max(8),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().trim().min(1).max(80),
      stockOverride: z.number().int().min(0).nullable(),
    })
  ),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function saveProduct(
  productId: string | null,
  input: ProductInput
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    if (productId) {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: {
            name: data.name,
            categoryId: data.categoryId,
            price: data.price,
            description: data.description,
            images: data.images,
            stock: data.stock,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
          },
        });
        const keepIds = data.variants.filter((v) => v.id).map((v) => v.id!);
        await tx.productVariant.deleteMany({
          where: { productId, id: { notIn: keepIds } },
        });
        for (const v of data.variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: { name: v.name, stockOverride: v.stockOverride },
            });
          } else {
            await tx.productVariant.create({
              data: { productId, name: v.name, stockOverride: v.stockOverride },
            });
          }
        }
      });
    } else {
      let slug = slugify(data.name);
      const clash = await prisma.product.findUnique({ where: { slug } });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      await prisma.product.create({
        data: {
          name: data.name,
          slug,
          categoryId: data.categoryId,
          price: data.price,
          description: data.description,
          images: data.images,
          stock: data.stock,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          variants: {
            create: data.variants.map((v) => ({
              name: v.name,
              stockOverride: v.stockOverride,
            })),
          },
        },
      });
    }
  } catch (err) {
    console.error("saveProduct failed:", err);
    return { ok: false, error: "Could not save the product. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  await requireAdmin();
  const orderCount = await prisma.orderItem.count({ where: { productId } });
  if (orderCount > 0) {
    // Products that appear on orders are deactivated, not deleted, to keep history intact.
    await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
    revalidatePath("/admin/products");
    return {
      ok: true,
      error: "Product has past orders, so it was set to inactive instead of deleted.",
    };
  }
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

/* ---------------- Categories ---------------- */

export async function saveCategory(
  categoryId: string | null,
  name: string
): Promise<ActionResult> {
  await requireAdmin();
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Name is too short" };
  const slug = slugify(trimmed);
  try {
    if (categoryId) {
      await prisma.category.update({ where: { id: categoryId }, data: { name: trimmed, slug } });
    } else {
      await prisma.category.create({ data: { name: trimmed, slug } });
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, error: "A category with that name already exists" };
    }
    throw err;
  }
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    return {
      ok: false,
      error: `Move or delete the ${productCount} product(s) in this category first`,
    };
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ---------------- Delivery zones ---------------- */

export async function saveZone(
  zoneId: string | null,
  name: string,
  feePesewas: number
): Promise<ActionResult> {
  await requireAdmin();
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Zone name is too short" };
  if (!Number.isInteger(feePesewas) || feePesewas < 0) {
    return { ok: false, error: "Enter a valid fee" };
  }
  if (zoneId) {
    await prisma.deliveryZone.update({
      where: { id: zoneId },
      data: { name: trimmed, fee: feePesewas },
    });
  } else {
    await prisma.deliveryZone.create({ data: { name: trimmed, fee: feePesewas } });
  }
  revalidatePath("/admin/zones");
  return { ok: true };
}

export async function deleteZone(zoneId: string): Promise<ActionResult> {
  await requireAdmin();
  const orderCount = await prisma.order.count({ where: { deliveryZoneId: zoneId } });
  if (orderCount > 0) {
    return { ok: false, error: "This zone has orders attached and can't be deleted" };
  }
  await prisma.deliveryZone.delete({ where: { id: zoneId } });
  revalidatePath("/admin/zones");
  return { ok: true };
}

/* ---------------- Orders ---------------- */

const STATUS_FLOW = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type OrderStatusValue = (typeof STATUS_FLOW)[number];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatusValue
): Promise<ActionResult> {
  await requireAdmin();
  if (!STATUS_FLOW.includes(status)) return { ok: false, error: "Invalid status" };

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { deliveryZone: true },
  });

  // Status-change SMS per PRD; wrapped so failures never block the update.
  if (status === "OUT_FOR_DELIVERY" || status === "DELIVERED") {
    await notifyStatusChange(order, status);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

/** Manual fallback when the Paystack webhook never arrived. */
export async function verifyOrderPayment(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!paystackConfigured()) {
    return { ok: false, error: "Paystack keys are not configured yet" };
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { deliveryZone: true },
  });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.paymentStatus === "PAID") return { ok: true };
  if (!order.paystackReference) {
    return { ok: false, error: "No Paystack reference on this order" };
  }

  try {
    const result = await verifyTransaction(order.paystackReference);
    if (!result.paid) {
      return { ok: false, error: `Paystack says: ${result.status}` };
    }
    if (result.amount < order.total) {
      return { ok: false, error: "Paid amount is less than the order total" };
    }
    const transitioned = await markOrderPaid(order.id);
    if (transitioned) await notifyOrderPaid(order);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    console.error("verifyOrderPayment failed:", err);
    return { ok: false, error: "Could not reach Paystack. Try again shortly." };
  }
}

/* ---------------- Settings ---------------- */

const settingsSchema = z.object({
  shopName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160),
  contactPhone: z.string().trim(),
  whatsappNumber: z.string().trim(),
  arkeselSenderId: z.string().trim().max(11, "Sender ID is max 11 characters"),
  logoUrl: z.string().trim().max(500),
});

export async function saveSettings(
  input: z.infer<typeof settingsSchema>
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = { ...parsed.data };

  for (const key of ["contactPhone", "whatsappNumber"] as const) {
    if (data[key]) {
      const normalized = normalizeGhanaPhone(data[key]);
      if (!normalized) {
        return { ok: false, error: `Enter a valid Ghana number for ${key === "contactPhone" ? "contact phone" : "WhatsApp"}` };
      }
      data[key] = normalized;
    }
  }

  for (const [key, value] of Object.entries(data)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
