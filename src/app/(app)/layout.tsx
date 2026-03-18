import Link from 'next/link';
import { LayoutDashboard, Bell, Wallet, Calendar, User } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // <div className="min-h-screen bg-base-300">
    <div className="min-h-screen bg-base-100">
      <nav className="hidden lg:flex navbar bg-base-300 shadow-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="navbar-start">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="btn btn-ghost text-2xl font-bold text-accent px-2"
          >
            Saverah
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link href="/reminders" className={'flex items-center gap-2'}>
                <Bell className="w-4 h-4" />
                Recordatorios
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Panel
              </Link>
            </li>
            <li>
              <Link href="/budget" className={'flex items-center gap-2'}>
                <Wallet className="w-4 h-4" />
                Presupuesto
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end gap-2">
          <UserMenu />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pb-18 lg:pb-0">{children}</main>

      {/* Bottom Navigation - Mobile/Tablet Only */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden btm-nav btm-nav-sm bg-base-300 border-t border-base-300 z-40">
        <div className="flex justify-around p-4 gap-4">
          <Link href="/reminders" className="flex flex-col items-center gap-1">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Recordatorios</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1">
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs">Panel</span>
          </Link>
          <Link href="/budget" className="flex flex-col items-center gap-1">
            <Wallet className="w-6 h-6" />
            <span className="text-xs">Presupuesto</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1">
            <User className="w-6 h-6" />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
