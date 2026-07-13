import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getShopSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getShopSettings();
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Shop identity and contact details shown across the storefront and in SMS messages.
      </p>
      <SettingsForm initial={settings} />
      <div className="mt-10 border-t border-border" />
      <ChangePasswordForm />
    </div>
  );
}
