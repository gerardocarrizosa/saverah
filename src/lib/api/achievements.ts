import { createSupabaseServerClient } from '../supabase/server';
import type { Achievement, UserAchievement } from '@/types/dashboard.types';

export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('points', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getUnviewedAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .eq('is_viewed', false)
    .order('unlocked_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function markAchievementAsViewed(
  userId: string,
  achievementId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('user_achievements')
    .update({ is_viewed: true })
    .eq('user_id', userId)
    .eq('achievement_id', achievementId);
  
  if (error) throw error;
}

export async function unlockAchievement(
  userId: string,
  achievementId: string,
  metadata: Record<string, unknown> = {}
): Promise<UserAchievement | null> {
  const supabase = await createSupabaseServerClient();
  
  // Check if already unlocked
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single();
  
  if (existing) return null; // Already unlocked
  
  // Unlock achievement
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      metadata,
      is_viewed: false,
    })
    .select(`
      *,
      achievement:achievements(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

interface UserStats {
  totalExpenses: number;
  balance: number;
  income: number;
  streak: number;
  uniqueCategories: number;
  totalPayments: number;
  consecutiveSavingsMonths: number;
}

export async function checkAndUnlockAchievements(
  userId: string,
  stats: UserStats
): Promise<UserAchievement[]> {
  const supabase = await createSupabaseServerClient();
  const unlocked: UserAchievement[] = [];
  
  // Get all achievements
  const achievements = await getAllAchievements();
  
  // Get already unlocked achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  
  const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
  
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;
    
    let shouldUnlock = false;
    let metadata: Record<string, unknown> = {};
    
    switch (achievement.condition_type) {
      case 'first_expense':
        if (stats.totalExpenses >= (achievement.condition_value || 1)) {
          shouldUnlock = true;
        }
        break;
        
      case 'savings_rate':
        if (stats.balance > 0 && stats.income > 0) {
          const savingsRate = (stats.balance / stats.income) * 100;
          if (savingsRate >= (achievement.condition_value || 20)) {
            shouldUnlock = true;
            metadata = { savingsRate: Math.round(savingsRate * 100) / 100 };
          }
        }
        break;
        
      case 'streak_days':
        if (stats.streak >= (achievement.condition_value || 7)) {
          shouldUnlock = true;
          metadata = { streakDays: stats.streak };
        }
        break;
        
      case 'unique_categories':
        if (stats.uniqueCategories >= (achievement.condition_value || 5)) {
          shouldUnlock = true;
          metadata = { uniqueCategories: stats.uniqueCategories };
        }
        break;
        
      case 'total_payments':
        if (stats.totalPayments >= (achievement.condition_value || 10)) {
          shouldUnlock = true;
          metadata = { totalPayments: stats.totalPayments };
        }
        break;
        
      case 'budget_adherence':
        if (stats.consecutiveSavingsMonths >= (achievement.condition_value || 3)) {
          shouldUnlock = true;
          metadata = { consecutiveMonths: stats.consecutiveSavingsMonths };
        }
        break;
    }
    
    if (shouldUnlock) {
      const newAchievement = await unlockAchievement(userId, achievement.id, metadata);
      if (newAchievement) {
        unlocked.push(newAchievement);
      }
    }
  }
  
  return unlocked;
}
