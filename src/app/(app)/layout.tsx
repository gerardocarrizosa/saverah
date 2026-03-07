'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bell, Wallet } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="navbar-start">
            <Link
              href="/dashboard"
              className="btn btn-ghost text-2xl font-bold text-primary px-2"
            >
              Saverah
            </Link>

            <div className="hidden lg:flex">
              <ul className="menu menu-horizontal px-1 gap-1">
                <li>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 ${isActive('/dashboard') ? 'bg-primary text-primary-content' : ''}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reminders"
                    className={`flex items-center gap-2 ${isActive('/reminders') ? 'bg-primary text-primary-content' : ''}`}
                  >
                    <Bell className="w-4 h-4" />
                    Recordatorios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/budget"
                    className={`flex items-center gap-2 ${isActive('/budget') ? 'bg-primary text-primary-content' : ''}`}
                  >
                    <Wallet className="w-4 h-4" />
                    Presupuesto
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="navbar-end gap-2">
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="lg:hidden btm-nav btm-nav-sm bg-base-100 border-t border-base-300">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center ${isActive('/dashboard') ? 'text-primary' : 'text-base-content/60'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs">Panel</span>
        </Link>
        <Link
          href="/reminders"
          className={`flex flex-col items-center ${isActive('/reminders') ? 'text-primary' : 'text-base-content/60'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs">Recordatorios</span>
        </Link>
        <Link
          href="/budget"
          className={`flex flex-col items-center ${isActive('/budget') ? 'text-primary' : 'text-base-content/60'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-xs">Presupuesto</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
