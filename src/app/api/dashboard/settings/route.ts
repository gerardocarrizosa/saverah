import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getDashboardSettings, updateDashboardSettings } from '@/lib/api/dashboardSettings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const settings = await getDashboardSettings(user.id);
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error fetching dashboard settings:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const settings = await updateDashboardSettings(user.id, body);
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
