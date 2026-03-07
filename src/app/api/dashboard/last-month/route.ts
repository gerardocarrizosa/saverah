import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getLastMonthBudgetSummary } from '@/lib/api/lastMonthSummary';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const summary = await getLastMonthBudgetSummary(user.id);
    
    if (!summary) {
      return NextResponse.json({ data: null });
    }
    
    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error('Error fetching last month summary:', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen del mes anterior' },
      { status: 500 }
    );
  }
}
