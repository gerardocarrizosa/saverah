import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentSavingsGoal, createSavingsGoal } from '@/lib/api/savingsGoals';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const goal = await getCurrentSavingsGoal(user.id);
    
    if (!goal) {
      return NextResponse.json({ data: null });
    }
    
    // Calculate progress (we'll need budget data from the request context or query it)
    // For now, return just the goal
    return NextResponse.json({ data: goal });
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    return NextResponse.json(
      { error: 'Error al obtener meta de ahorro' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const today = new Date();
    const goal = await createSavingsGoal(user.id, {
      goal_type: body.goal_type,
      target_amount: body.target_amount,
      target_percentage: body.target_percentage,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
    
    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating savings goal:', error);
    const message = error instanceof Error ? error.message : 'Error al crear meta';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
