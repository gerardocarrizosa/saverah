import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getRecentActivity } from '@/lib/api/recentActivity';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Get limit from query params (default to 5)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    const activities = await getRecentActivity(user.id, limit);
    
    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividad reciente' },
      { status: 500 }
    );
  }
}
