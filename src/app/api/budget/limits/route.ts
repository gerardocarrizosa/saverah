import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { setBudgetLimit } from '@/lib/api/budget';
import { budgetLimitSchema } from '@/lib/validations/budget.schemas';

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
      const validated = await budgetLimitSchema.validate(body, {
        abortEarly: false,
      });
      const limit = await setBudgetLimit(user.id, validated.category, validated.monthly_limit);
      return NextResponse.json({ data: limit }, { status: 201 });
    } catch (validationError: unknown) {
      const errors = validationError && typeof validationError === 'object' && 'errors' in validationError
        ? (validationError as { errors: string[] }).errors
        : ['Error de validación'];
      return NextResponse.json(
        { error: errors },
        { status: 422 },
      );
    }
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
