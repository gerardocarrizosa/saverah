import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getBudgetSummary, isMonthFormatError } from '@/lib/api/budget';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const month = req.nextUrl.searchParams.get('month') || undefined;
    const summary = await getBudgetSummary(user.id, month);
    return NextResponse.json({ data: summary });
  } catch (err) {
    if (isMonthFormatError(err)) {
      return NextResponse.json(
        { error: 'El mes debe tener formato YYYY-MM' },
        { status: 422 },
      );
    }

    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
