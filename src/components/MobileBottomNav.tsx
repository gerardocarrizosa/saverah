'use client';

import Link from 'next/link';
import { LayoutDashboard, Calendar, Wallet } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-base-300 border-t border-base-300 z-40">
      <div className="flex justify-around items-center p-4 gap-4">
        <Link href="/reminders" className="flex flex-col items-center gap-1">
          <Calendar className="w-6 h-6" />
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1">
          <LayoutDashboard className="w-6 h-6" />
        </Link>
        <Link href="/budget" className="flex flex-col items-center gap-1">
          <Wallet className="w-6 h-6" />
        </Link>
        <UserMenu />
      </div>
    </div>
  );
}
