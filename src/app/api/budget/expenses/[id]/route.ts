import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updateExpense, deleteExpense } from '@/lib/api/budget';
import { updateExpenseSchema } from '@/lib/validations/budget.schemas';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    try {
      const validated = await updateExpenseSchema.validate(body, {
        abortEarly: false,
      });
      const expense = await updateExpense(user.id, id, validated);
      return NextResponse.json({ data: expense });
    } catch (validationError: unknown) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Validation error';
      return NextResponse.json(
        { error: errorMessage },
        { status: 422 },
      );
    }
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteExpense(user.id, id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
