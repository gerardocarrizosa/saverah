'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Loader2,
  Lock,
  Sparkles,
  Target,
  Zap,
  PiggyBank,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import api from '@/lib/axios';
import type { Achievement, UserAchievement } from '@/types/dashboard.types';

interface AchievementsData {
  achievements: UserAchievement[];
  unviewedCount: number;
}

export function Achievements() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlocked, setShowUnlocked] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await api.get('/dashboard/achievements');
      setData(response.data.data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementIcon = (type: Achievement['condition_type']) => {
    switch (type) {
      case 'first_expense':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'savings_rate':
        return <PiggyBank className="w-5 h-5" />;
      case 'streak_days':
        return <Zap className="w-5 h-5" />;
      case 'unique_categories':
        return <Target className="w-5 h-5" />;
      case 'total_payments':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'budget_adherence':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getAchievementColor = (type: Achievement['condition_type']) => {
    switch (type) {
      case 'first_expense':
        return 'bg-info/20 text-info';
      case 'savings_rate':
        return 'bg-success/20 text-success';
      case 'streak_days':
        return 'bg-warning/20 text-warning';
      case 'unique_categories':
        return 'bg-secondary/20 text-secondary';
      case 'total_payments':
        return 'bg-primary/20 text-primary';
      case 'budget_adherence':
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-base-200 text-base-content';
    }
  };

  const getEmojiForAchievement = (title: string): string => {
    const emojiMap: Record<string, string> = {
      'Primeros Pasos': '🌱',
      'Ahorrador Principiante': '💰',
      'Ahorrador Pro': '🏦',
      'Racha de 7 Días': '🔥',
      'Racha de 30 Días': '⚡',
      'Categorías Diversas': '📊',
      'Pagador Puntual': '💳',
      'Experto en Presupuesto': '🎯',
      'Maestro del Ahorro': '👑',
      'Leyenda Financiera': '🌟',
    };
    return emojiMap[title] || '🏆';
  };

  const calculateProgress = (): { unlocked: number; total: number; percentage: number } => {
    if (!data) return { unlocked: 0, total: 10, percentage: 0 };
    const unlocked = data.achievements.length;
    return { unlocked, total: 10, percentage: (unlocked / 10) * 100 };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
        <p className="text-base-content/60">No se pudieron cargar los logros</p>
      </div>
    );
  }

  const progress = calculateProgress();
  const hasUnviewed = data.unviewedCount > 0;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-warning/20">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="font-medium text-sm">Tus logros</p>
            <p className="text-xs text-base-content/60">
              {progress.unlocked} de {progress.total} desbloqueados
            </p>
          </div>
        </div>
        {hasUnviewed && (
          <div className="badge badge-primary gap-1">
            <Sparkles className="w-3 h-3" />
            {data.unviewedCount} nuevo{data.unviewedCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full bg-base-300 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-warning transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-center text-base-content/60">
          {Math.round(progress.percentage)}% completado
        </p>
      </div>

      {/* Achievements list */}
      {data.achievements.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🏃</div>
          <p className="text-sm text-base-content/60">
            ¡Comienza a registrar gastos para desbloquear logros!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.achievements.slice(0, showUnlocked ? undefined : 3).map((userAchievement) => (
            <div
              key={userAchievement.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                !userAchievement.is_viewed 
                  ? 'bg-warning/10 border border-warning/30' 
                  : 'bg-base-200/50'
              }`}
            >
              <div className="text-2xl">
                {getEmojiForAchievement(userAchievement.achievement?.title || '')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {userAchievement.achievement?.title}
                  </p>
                  {!userAchievement.is_viewed && (
                    <Sparkles className="w-3 h-3 text-warning animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  {userAchievement.achievement?.description}
                </p>
                <p className="text-xs text-base-content/40 mt-1">
                  Desbloqueado el {formatDate(userAchievement.unlocked_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`p-1.5 rounded-lg ${getAchievementColor(userAchievement.achievement?.condition_type || 'first_expense')}`}>
                  {getAchievementIcon(userAchievement.achievement?.condition_type || 'first_expense')}
                </div>
                <span className="text-xs font-bold text-warning">
                  +{userAchievement.achievement?.points} pts
                </span>
              </div>
            </div>
          ))}

          {data.achievements.length > 3 && (
            <button
              onClick={() => setShowUnlocked(!showUnlocked)}
              className="btn btn-ghost btn-sm w-full"
            >
              {showUnlocked ? 'Mostrar menos' : `Ver ${data.achievements.length - 3} más`}
            </button>
          )}
        </div>
      )}

      {/* Locked achievements preview */}
      {progress.unlocked < 10 && (
        <div className="pt-2 border-t border-base-300">
          <p className="text-xs text-base-content/50 flex items-center gap-1 mb-2">
            <Lock className="w-3 h-3" />
            Logros por desbloquear
          </p>
          <div className="flex gap-2 flex-wrap">
            {['🎯', '👑', '💎', '⭐', '🚀'].map((emoji, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-base-content/30"
                title="¡Sigue usando Saverah para desbloquear más logros!"
              >
                <span className="text-sm">{emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational message */}
      {progress.unlocked === 10 ? (
        <div className="alert alert-success text-sm">
          <Trophy className="w-5 h-5" />
          <span>¡Increíble! Has desbloqueado todos los logros 🌟</span>
        </div>
      ) : progress.unlocked > 5 ? (
        <div className="alert alert-info text-sm">
          <Star className="w-5 h-5" />
          <span>¡Vas muy bien! Sigue así para desbloquear más logros 💪</span>
        </div>
      ) : null}
    </div>
  );
}
