import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getBudgetSummary } from '@/lib/api/budget';

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

    const summary = await getBudgetSummary(user.id);
    return NextResponse.json({ data: summary });
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
