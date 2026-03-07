'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function UserMenu() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="dropdown dropdown-end">
      <button 
        tabIndex={0} 
        className="btn btn-ghost btn-circle avatar"
        aria-label="Menú de usuario"
      >
        <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
      </button>
      
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-sm bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-xl border border-base-300"
      >
        <li>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Mi Perfil</span>
          </Link>
        </li>
        
        <li>
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full text-left"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Modo oscuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Modo claro</span>
              </>
            )}
          </button>
        </li>
        
        <div className="divider my-1"></div>
        
        <li>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-error hover:text-error"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
