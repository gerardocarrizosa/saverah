import Link from "next/link";
import { LayoutDashboard, Bell, Wallet } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { MobileNav } from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-base-100 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xl font-extrabold text-base-content tracking-tighter font-(family-name:--font-headline)"
          >
            Saverah
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Panel
          </Link>
          <Link
            href="/reminders"
            className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors"
          >
            <Bell className="w-4 h-4" />
            Recordatorios
          </Link>
          <Link
            href="/budget"
            className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors"
          >
            <Wallet className="w-4 h-4" />
            Presupuesto
          </Link>
          <div className="w-px h-5 bg-base-300" />
          <UserMenu />
        </div>
      </header>

      <main className="pt-16 pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full lg:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile/Tablet Only */}
      <MobileNav />
    </div>
  );
}
