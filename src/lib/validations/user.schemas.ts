import * as Yup from 'yup';

export const updateProfileSchema = Yup.object({
  full_name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .optional(),
  phone: Yup.string()
    .matches(/^[\+]?[\d\s\-\(\)]{8,20}$/, 'Número de teléfono inválido')
    .optional(),
  avatar_url: Yup.string()
    .url('URL de imagen inválida')
    .optional(),
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es requerido'),
});

export const changePasswordSchema = Yup.object({
  current_password: Yup.string()
    .required('La contraseña actual es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  new_password: Yup.string()
    .required('La nueva contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .notOneOf(
      [Yup.ref('current_password')],
      'La nueva contraseña debe ser diferente a la actual'
    ),
  confirm_password: Yup.string()
    .required('Confirma la nueva contraseña')
    .oneOf([Yup.ref('new_password')], 'Las contraseñas no coinciden'),
});

export type UpdateProfileInput = Yup.InferType<typeof updateProfileSchema>;
export type ChangePasswordInput = Yup.InferType<typeof changePasswordSchema>;
