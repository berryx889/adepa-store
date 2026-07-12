import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user from env
  const email = process.env.ADMIN_EMAIL ?? "admin@store.local";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });
  console.log(`Admin user ready: ${email}`);

  // Categories
  const categories = [
    { name: "Liquid soap", slug: "liquid-soap" },
    { name: "Perfumes", slug: "perfumes" },
    { name: "Smocks", slug: "smocks" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }
  const bySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  // Sample products (prices in pesewas)
  const products: Array<{
    name: string;
    slug: string;
    description: string;
    price: number;
    categorySlug: string;
    images: string[];
    stock: number;
    isFeatured: boolean;
    variants?: string[];
  }> = [
    {
      name: "Lavender liquid soap",
      slug: "lavender-liquid-soap",
      description:
        "Gentle, richly lathering liquid soap infused with lavender essential oil. Kind to skin, tough on grease. Made in small batches in Accra.",
      price: 3500, // GH₵ 35.00
      categorySlug: "liquid-soap",
      images: ["/products/lavender-soap-1.jpg", "/products/lavender-soap-2.jpg"],
      stock: 40,
      isFeatured: true,
      variants: ["500ml", "1L"],
    },
    {
      name: "Signature oud perfume",
      slug: "signature-oud-perfume",
      description:
        "A deep, warm oud with notes of amber and spice. Long-lasting eau de parfum that carries from morning meetings to evening events.",
      price: 24000, // GH₵ 240.00
      categorySlug: "perfumes",
      images: ["/products/oud-perfume-1.jpg", "/products/oud-perfume-2.jpg"],
      stock: 15,
      isFeatured: true,
      variants: ["50ml", "100ml"],
    },
    {
      name: "Royal Tamale smock",
      slug: "royal-tamale-smock",
      description:
        "Handwoven fugu smock from Tamale in classic black-and-white stripes. Breathable cotton, embroidered neckline, made by master weavers.",
      price: 45000, // GH₵ 450.00
      categorySlug: "smocks",
      images: ["/products/smock-1.jpg", "/products/smock-2.jpg"],
      stock: 8,
      isFeatured: true,
      variants: ["Size M", "Size L", "Size XL"],
    },
  ];

  for (const p of products) {
    const { categorySlug, variants, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, categoryId: bySlug[categorySlug] },
    });
    if (variants) {
      const existing = await prisma.productVariant.count({
        where: { productId: product.id },
      });
      if (existing === 0) {
        await prisma.productVariant.createMany({
          data: variants.map((name) => ({ productId: product.id, name })),
        });
      }
    }
  }
  console.log(`Seeded ${products.length} products in ${categories.length} categories`);

  // Delivery zones
  const zones = [
    { name: "Accra central", fee: 1500 },
    { name: "Tema", fee: 2500 },
    { name: "Kasoa", fee: 3000 },
    { name: "Outside Accra", fee: 5000 },
  ];
  for (const z of zones) {
    const found = await prisma.deliveryZone.findFirst({ where: { name: z.name } });
    if (!found) await prisma.deliveryZone.create({ data: z });
  }
  console.log(`Seeded ${zones.length} delivery zones`);

  // Shop settings
  const settings: Record<string, string> = {
    shopName: "Adepa Store",
    tagline: "Authentic Ghanaian craft — soap, scent and smocks",
    contactPhone: "+233200000000",
    whatsappNumber: "+233200000000",
    arkeselSenderId: "AdepaStore",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Seeded shop settings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
