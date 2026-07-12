import { requireAdmin } from "@/lib/admin";
import { getShopSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const settings = await getShopSettings();
  return (
    <AdminShell shopName={settings.shopName} email={session.user?.email ?? ""}>
      {children}
    </AdminShell>
  );
}
