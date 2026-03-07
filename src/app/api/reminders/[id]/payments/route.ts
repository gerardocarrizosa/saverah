import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createReminderPayment, getReminderPayments } from '@/lib/api/reminders';
import { createPaymentSchema } from '@/lib/validations/reminder.schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payments = await getReminderPayments(user.id, params.id);
    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const payment = await createReminderPayment(
      user.id,
      params.id,
      body.amount_paid,
      body.paid_at
    );

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Error al registrar pago' },
      { status: 500 }
    );
  }
}
