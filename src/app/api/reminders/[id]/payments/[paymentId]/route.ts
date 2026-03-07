import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createPaymentSchema } from '@/lib/validations/reminder.schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    try {
      await createPaymentSchema.validate(body, { abortEarly: false });
    } catch (validationError: unknown) {
      const errorMessages = (validationError as { errors?: string[] }).errors || ['Error de validación'];
      return NextResponse.json(
        { error: errorMessages },
        { status: 422 }
      );
    }

    const { error } = await supabase
      .from('reminder_payments')
      .update({
        amount_paid: body.amount_paid,
        paid_at: body.paid_at,
      })
      .eq('id', params.paymentId)
      .eq('reminder_id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar pago' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('reminder_payments')
      .delete()
      .eq('id', params.paymentId)
      .eq('reminder_id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Error al eliminar pago' },
      { status: 500 }
    );
  }
}
