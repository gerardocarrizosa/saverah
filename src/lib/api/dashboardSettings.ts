import { createSupabaseServerClient } from '../supabase/server';
import type { DashboardSettings, UpdateDashboardSettingsInput } from '@/types/dashboard.types';

export async function getDashboardSettings(userId: string): Promise<DashboardSettings> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('user_dashboard_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    // If no settings exist, create default settings
    if (error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_dashboard_settings')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (createError) throw createError;
      return newSettings;
    }
    throw error;
  }
  
  return data;
}

export async function updateDashboardSettings(
  userId: string,
  updates: UpdateDashboardSettingsInput
): Promise<DashboardSettings> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('user_dashboard_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function toggleSectionVisibility(
  userId: string,
  sectionId: string,
  isExpanded: boolean
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // Map section IDs to column names
  const sectionColumnMap: Record<string, string> = {
    'quick-stats': 'quick_stats_expanded',
    'urgent-alerts': 'urgent_alerts_expanded',
    'budget-alerts': 'budget_alerts_expanded',
    'monthly-overview': 'monthly_overview_expanded',
    'recent-activity': 'recent_activity_expanded',
    'savings-goals': 'savings_goals_expanded',
    'budget-streak': 'budget_streak_expanded',
    'achievements': 'achievements_expanded',
    'credit-cards': 'credit_cards_expanded',
  };
  
  const columnName = sectionColumnMap[sectionId];
  if (!columnName) {
    throw new Error(`Invalid section ID: ${sectionId}`);
  }
  
  const { error } = await supabase
    .from('user_dashboard_settings')
    .update({
      [columnName]: isExpanded,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (error) throw error;
}

export async function toggleStatsVisibility(
  userId: string,
  isVisible: boolean
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('user_dashboard_settings')
    .update({
      stats_visibility: isVisible,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (error) throw error;
}
