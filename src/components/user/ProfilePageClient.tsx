'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Sun,
  Moon,
  Settings2,
  Pencil,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import type { UserProfile } from '@/types/user.types';

interface ProfilePageClientProps {
  user: UserProfile;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-base-200 last:border-0">
      <div className="p-2 rounded-lg bg-base-200/70 shrink-0">
        <Icon className="w-4 h-4 text-base-content/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-base-content truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function AvatarDisplay({ url, name }: { url: string | null; name: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt="Avatar"
        className="w-16 h-16 rounded-full object-cover border-2 border-base-300"
      />
    );
  }

  return (
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-base-300">
      <span className="text-2xl font-bold text-primary">
        {name?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Format dates for display
  const createdAtFormatted = new Date(user.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastSignInFormatted = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="p-4 space-y-6">
      {/* Header - Consistent with dashboard/reminders pattern */}
      <header className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Settings2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-base-content">Mi Perfil</h1>
      </header>

      {/* User Summary Card */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <AvatarDisplay url={user.avatar_url} name={user.full_name || user.email} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-base-content truncate">
              {user.full_name || 'Usuario'}
            </h2>
            <p className="text-sm text-base-content/60 truncate">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-base-content/50">{user.phone}</p>
            )}
          </div>
        </div>
      </section>

      {/* Account Information Section */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-base-content uppercase tracking-wide">
              Información de la cuenta
            </h2>
          </div>
          <Link
            href="/profile/edit"
            className="btn btn-sm btn-ghost gap-2"
            aria-label="Editar información"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
        </div>

        <div className="space-y-0">
          <InfoRow icon={Mail} label="Correo electrónico" value={user.email} />
          <InfoRow
            icon={Calendar}
            label="Cuenta creada el"
            value={createdAtFormatted}
          />
          {lastSignInFormatted && (
            <InfoRow
              icon={Calendar}
              label="Último inicio de sesión"
              value={lastSignInFormatted}
            />
          )}
        </div>
      </section>

      {/* Preferences Section */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-base-200/70">
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-base-content/60" />
              ) : (
                <Moon className="w-4 h-4 text-base-content/60" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">
                {theme === 'light' ? 'Modo claro' : 'Modo oscuro'}
              </h2>
              <p className="text-xs text-base-content/50">
                Cambia la apariencia de la aplicación
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-ghost gap-2"
            aria-label={
              theme === 'light'
                ? 'Cambiar a modo oscuro'
                : 'Cambiar a modo claro'
            }
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">Oscuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline">Claro</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Actions Section */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-error/10">
              <LogOut className="w-4 h-4 text-error" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">
                Cerrar sesión
              </h2>
              <p className="text-xs text-base-content/50">
                Saldrás de tu cuenta en este dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-error btn-outline gap-2 rounded"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </section>
    </div>
  );
}
