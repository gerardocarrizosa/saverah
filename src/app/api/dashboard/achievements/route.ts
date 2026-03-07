import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserAchievements, getUnviewedAchievements } from '@/lib/api/achievements';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const achievements = await getUserAchievements(user.id);
    const unviewed = await getUnviewedAchievements(user.id);
    
    return NextResponse.json({ 
      data: {
        achievements,
        unviewedCount: unviewed.length
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Error al obtener logros' },
      { status: 500 }
    );
  }
}
