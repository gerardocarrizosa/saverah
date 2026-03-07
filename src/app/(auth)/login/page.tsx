'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Email requerido'),
  password: Yup.string().required('Contraseña requerida'),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h2 className="card-title text-3xl font-bold justify-center text-base-content">
              Iniciar sesión en Saverah
            </h2>
            <p className="mt-2 text-base-content/70">
              Gestiona tus finanzas personales
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setError(null);
              try {
                const { error } = await supabaseBrowser.auth.signInWithPassword({
                  email: values.email,
                  password: values.password,
                });

                if (error) {
                  setError(error.message);
                } else {
                  router.push('/dashboard');
                  router.refresh();
                }
              } catch {
                setError('Error al iniciar sesión');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {error && (
                  <div className="alert alert-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="tu@email.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-error text-sm mt-1" />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </span>
                  </label>
                  <Field
                    name="password"
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="div" className="text-error text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link href="/signup" className="link link-primary text-sm">
                    ¿No tienes cuenta? Regístrate
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
