"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bell, Wallet, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/reminders", label: "Recordatorios", icon: Bell },
  { href: "/budget", label: "Presupuesto", icon: Wallet },
  { href: "/profile", label: "Perfil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center p-4 bg-[#393939]/70 backdrop-blur-xl rounded-t-3xl shadow md:hidden">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-300 ease-out ${
              isActive
                ? "text-secondary scale-110"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <Icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-(family-name:--font-body) text-[10px] uppercase tracking-widest font-medium">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 bg-secondary rounded-full mt-1" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
