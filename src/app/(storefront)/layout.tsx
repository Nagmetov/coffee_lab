import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { listCategories } from "@/server/product-service";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listCategories();

  return (
    <>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
