import { getShopSettings } from "@/lib/settings";
import { StoreProviders } from "@/components/store/Providers";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getShopSettings();
  return (
    <StoreProviders>
      <Header shopName={settings.shopName} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer
        shopName={settings.shopName}
        tagline={settings.tagline}
        contactPhone={settings.contactPhone}
        whatsappNumber={settings.whatsappNumber}
      />
    </StoreProviders>
  );
}
