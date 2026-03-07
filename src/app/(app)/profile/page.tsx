'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { User, Mail, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type UserProfile = {
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabaseBrowser.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser({
        email: authUser.email || '',
        created_at: new Date(authUser.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        last_sign_in_at: authUser.last_sign_in_at 
          ? new Date(authUser.last_sign_in_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : null
      });
      setLoading(false);
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl mb-6">Mi Perfil</h1>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-24 h-24">
                <User className="w-12 h-12" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo electrónico
                  </span>
                </label>
                <div className="input input-bordered flex items-center bg-base-200">
                  {user.email}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Cuenta creada el
                  </span>
                </label>
                <div className="input input-bordered flex items-center bg-base-200">
                  {user.created_at}
                </div>
              </div>

              {user.last_sign_in_at && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Último inicio de sesión
                    </span>
                  </label>
                  <div className="input input-bordered flex items-center bg-base-200">
                    {user.last_sign_in_at}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="divider"></div>

          <div className="alert alert-info bg-base-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Próximamente podrás editar tu información de perfil y cambiar tu contraseña desde esta sección.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
