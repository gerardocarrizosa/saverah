import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentStreak } from '@/lib/api/streakHistory';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const streak = await getCurrentStreak(user.id);
    
    return NextResponse.json({ data: { streak } });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Error al obtener racha' },
      { status: 500 }
    );
  }
}
