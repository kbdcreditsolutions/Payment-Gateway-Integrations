import { ShopHeader } from "@/components/shop-header";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ShopHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
