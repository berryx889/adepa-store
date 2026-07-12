import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getShopSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin login" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");
  const settings = await getShopSettings();

  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden lg:flex flex-col justify-between bg-primary text-on-primary p-10 overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/hero.jpg"
            alt=""
            fill
            sizes="50vw"
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-primary/30" />
        </div>
        <p className="relative font-display text-3xl font-semibold">{settings.shopName}</p>
        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-tight max-w-md">
            Run your store from anywhere
          </h1>
          <p className="mt-3 text-on-primary/70 max-w-sm">
            Orders, products, deliveries and payments — all in one place.
          </p>
        </div>
        <p className="relative text-sm text-on-primary/50">
          © {new Date().getFullYear()} {settings.shopName}
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <LoginForm shopName={settings.shopName} />
      </div>
    </div>
  );
}
