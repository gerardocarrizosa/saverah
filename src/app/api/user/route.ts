import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updateUserProfile, changeUserPassword } from '@/lib/api/user';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '@/lib/validations/user.schemas';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a profile update or password change
    if (body.current_password) {
      // Password change request
      try {
        const validated = await changePasswordSchema.validate(body, {
          abortEarly: false,
        });
        await changeUserPassword(validated);
        return NextResponse.json({
          data: { message: 'Contraseña actualizada exitosamente' },
        });
      } catch (validationError: unknown) {
        const errorMessage =
          validationError instanceof Error
            ? validationError.message
            : 'Error de validación';
        return NextResponse.json({ error: errorMessage }, { status: 422 });
      }
    } else {
      // Profile update request
      try {
        const validated = await updateProfileSchema.validate(body, {
          abortEarly: false,
        });
        const updatedUser = await updateUserProfile(validated);
        return NextResponse.json({ data: updatedUser });
      } catch (validationError: unknown) {
        const errorMessage =
          validationError instanceof Error
            ? validationError.message
            : 'Error de validación';
        return NextResponse.json({ error: errorMessage }, { status: 422 });
      }
    }
  } catch (error) {
    console.error('[API Error] User update:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}
