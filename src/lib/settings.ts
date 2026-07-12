import { prisma } from "@/lib/prisma";

export type ShopSettings = {
  shopName: string;
  tagline: string;
  contactPhone: string;
  whatsappNumber: string;
  arkeselSenderId: string;
  logoUrl: string;
};

const DEFAULTS: ShopSettings = {
  shopName: "Adepa Store",
  tagline: "Authentic Ghanaian craft — soap, scent and smocks",
  contactPhone: "",
  whatsappNumber: "",
  arkeselSenderId: "",
  logoUrl: "",
};

export async function getShopSettings(): Promise<ShopSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...map } as ShopSettings;
}
