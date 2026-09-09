import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminThemeScope } from "@/components/admin/admin-theme-scope";

export const metadata = { title: { template: "%s · Админ CoffeeLab", default: "Админ" } };

// Every admin page reads live, request-time data (stats, orders, stock)
// behind an auth check — never safe to statically prerender at build time.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-admin dark bg-background text-foreground flex min-h-dvh">
      <AdminThemeScope />
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
