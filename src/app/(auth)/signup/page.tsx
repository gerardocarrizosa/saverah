'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const signupSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Email requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h2 className="card-title text-3xl font-bold justify-center text-base-content">
              Crear cuenta en Saverah
            </h2>
            <p className="mt-2 text-base-content/70">
              Comienza a gestionar tus finanzas
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '', confirmPassword: '' }}
            validationSchema={signupSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setError(null);
              try {
                const { error } = await supabaseBrowser.auth.signUp({
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
                setError('Error al crear cuenta');
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
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">Mínimo 6 caracteres</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirmar contraseña
                    </span>
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-error text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link href="/login" className="link link-primary text-sm">
                    ¿Ya tienes cuenta? Inicia sesión
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
