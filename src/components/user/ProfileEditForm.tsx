'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { useState, useRef } from 'react';
import api from '@/lib/axios';
import { updateProfileSchema } from '@/lib/validations/user.schemas';
import type { UserProfile } from '@/types/user.types';
import {
  User,
  Mail,
  Phone,
  Camera,
  AlertCircle,
  Loader2,
  Save,
  ArrowLeft,
  Upload,
  ImageIcon,
} from 'lucide-react';

interface ProfileEditFormProps {
  user: UserProfile;
}

interface ProfileFormValues {
  full_name: string;
  phone: string;
  avatar_url: string;
  email: string;
}

const profileInitialValues = (user: UserProfile): ProfileFormValues => ({
  full_name: user.full_name || '',
  phone: user.phone || '',
  avatar_url: user.avatar_url || '',
  email: user.email,
});

// Avatar upload component
function AvatarUploadField({ user }: { user: UserProfile }) {
  const { setFieldValue } = useFormikContext<ProfileFormValues>();
  const [preview, setPreview] = useState<string | null>(user.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload file using FormData
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post<{ data: { url: string } }>(
        '/user/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Update form value with uploaded URL
      setFieldValue('avatar_url', res.data.data.url);
      setPreview(res.data.data.url);
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Error al subir la imagen',
      );
      // Revert to original preview
      setPreview(user.avatar_url);
    } finally {
      setUploading(false);
      // Clean up object URL
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Foto de perfil (opcional)
        </span>
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-base-300"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center border-2 border-base-300">
              <ImageIcon className="w-8 h-8 text-base-content/40" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="btn btn-outline btn-sm gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {preview ? 'Cambiar imagen' : 'Subir imagen'}
              </>
            )}
          </button>
          <p className="text-xs text-base-content/50 mt-2">
            Formatos: JPG, PNG, GIF. Máximo 5MB.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="text-error text-sm mt-2">{uploadError}</div>
      )}

      {/* Hidden field for avatar URL */}
      <Field name="avatar_url" type="hidden" />
    </div>
  );
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    values: ProfileFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setError(null);

    try {
      await api.patch<{ data: UserProfile }>('/user', values);
      // Navigate back to profile page on success
      router.push('/profile');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el perfil',
      );
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-base-content">Editar Perfil</h1>
      </header>

      {/* Edit Form */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <Formik
          initialValues={profileInitialValues(user)}
          validationSchema={updateProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Avatar Upload */}
              <AvatarUploadField user={user} />

              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre completo (opcional)
                  </span>
                </label>
                <Field
                  name="full_name"
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Tu nombre completo"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="full_name"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono (opcional)
                  </span>
                </label>
                <Field
                  name="phone"
                  type="tel"
                  className="input input-bordered w-full"
                  placeholder="+1 234 567 8900"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo electrónico
                  </span>
                </label>
                <Field
                  name="email"
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-error text-sm mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-200 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="btn btn-ghost flex-1 sm:flex-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </section>

      {/* Password Change Section */}
      <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-secondary/10">
            <User className="w-4 h-4 text-secondary" />
          </div>
          <h2 className="text-sm font-semibold text-base-content uppercase tracking-wide">
            Cambiar contraseña
          </h2>
        </div>
        <p className="text-sm text-base-content/70 mb-4">
          Para cambiar tu contraseña, primero guarda los cambios de tu perfil.
        </p>
        <Link
          href="/profile/edit/password"
          className="btn btn-secondary btn-outline gap-2"
        >
          <User className="w-4 h-4" />
          Cambiar contraseña
        </Link>
      </section>
    </div>
  );
}
