import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getExpenses, createExpense } from '@/lib/api/budget';
import { createExpenseSchema } from '@/lib/validations/budget.schemas';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenses = await getExpenses(user.id);
    return NextResponse.json({ data: expenses });
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      const validated = await createExpenseSchema.validate(body, {
        abortEarly: false,
      });
      const expense = await createExpense(user.id, validated);
      return NextResponse.json({ data: expense }, { status: 201 });
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
