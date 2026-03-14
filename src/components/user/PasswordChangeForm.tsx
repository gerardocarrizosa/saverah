'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import api from '@/lib/axios';
import { changePasswordSchema } from '@/lib/validations/user.schemas';
import {
  Lock,
  KeyRound,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const passwordInitialValues: PasswordFormValues = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export function PasswordChangeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    values: PasswordFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    setError(null);
    setSuccess(false);

    try {
      await api.patch('/user', {
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      setSuccess(true);
      resetForm();
      // Navigate back after showing success message briefly
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar la contraseña'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-secondary/10">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-base-content">Cambiar Contraseña</h1>
      </header>

      {/* Password Form */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <Formik
          initialValues={passwordInitialValues}
          validationSchema={changePasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <Check className="w-5 h-5" />
                  <span>Contraseña actualizada exitosamente. Redirigiendo...</span>
                </div>
              )}

              {/* Current Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Contraseña actual
                  </span>
                </label>
                <Field
                  name="current_password"
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Ingresa tu contraseña actual"
                  disabled={isSubmitting || success}
                />
                <ErrorMessage
                  name="current_password"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Nueva contraseña
                  </span>
                </label>
                <Field
                  name="new_password"
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting || success}
                />
                <ErrorMessage
                  name="new_password"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar nueva contraseña
                  </span>
                </label>
                <Field
                  name="confirm_password"
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Repite la nueva contraseña"
                  disabled={isSubmitting || success}
                />
                <ErrorMessage
                  name="confirm_password"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-200 mt-6">
                <Link
                  href="/profile/edit"
                  className="btn btn-ghost flex-1 sm:flex-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="btn btn-secondary flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}
