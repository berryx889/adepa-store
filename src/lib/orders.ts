import { prisma } from "@/lib/prisma";

/** Human-readable order number, e.g. ORD-2026-0042. Retries on rare collisions. */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const countThisYear = await prisma.order.count({
    where: { createdAt: { gte: startOfYear } },
  });
  return `ORD-${year}-${String(countThisYear + 1).padStart(4, "0")}`;
}

export type CheckoutItemInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export class CheckoutError extends Error {
  constructor(
    message: string,
    public code: "OUT_OF_STOCK" | "NOT_FOUND" | "INVALID"
  ) {
    super(message);
  }
}

/**
 * Validates cart against live stock and prices — never trusts client totals —
 * and creates the order as PENDING/UNPAID inside a transaction.
 */
export async function createOrder(input: {
  customerName: string;
  phone: string; // already normalized +233…
  address: string;
  deliveryZoneId: string;
  note?: string;
  items: CheckoutItemInput[];
}) {
  const zone = await prisma.deliveryZone.findUnique({
    where: { id: input.deliveryZoneId },
  });
  if (!zone) throw new CheckoutError("Delivery zone not found", "INVALID");

  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems: Array<{
    productId: string;
    variantId: string | null;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
  }> = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new CheckoutError("A product in your cart is no longer available", "NOT_FOUND");
    }
    let name = product.name;
    let stock = product.stock;
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new CheckoutError(
          `Selected option for ${product.name} is no longer available`,
          "NOT_FOUND"
        );
      }
      name = `${product.name} (${variant.name})`;
      stock = variant.stockOverride ?? product.stock;
    }
    if (item.quantity > stock) {
      throw new CheckoutError(
        `Only ${stock} of ${name} left in stock`,
        "OUT_OF_STOCK"
      );
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      variantId: item.variantId,
      nameSnapshot: name,
      priceSnapshot: product.price,
      quantity: item.quantity,
    });
  }

  const orderNumber = await generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      deliveryZoneId: zone.id,
      deliveryFee: zone.fee,
      subtotal,
      total: subtotal + zone.fee,
      note: input.note || null,
      items: { create: orderItems },
    },
    include: { items: true, deliveryZone: true },
  });

  return order;
}

/**
 * Marks an order paid and decrements stock exactly once (idempotent via
 * stockDecremented flag checked inside the transaction).
 * Returns true if this call performed the transition.
 */
export async function markOrderPaid(orderId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.stockDecremented) return false;

    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED", stockDecremented: true },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant?.stockOverride != null) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockOverride: { decrement: item.quantity } },
          });
        }
      }
    }
    return true;
  });
}
