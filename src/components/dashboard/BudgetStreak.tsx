'use client';

import { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  Calendar, 
  Loader2,
  CheckCircle2,
  Target
} from 'lucide-react';
import api from '@/lib/axios';

interface StreakData {
  streak: number;
}

export function BudgetStreak() {
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<boolean[]>([]);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const response = await api.get('/dashboard/streak');
      const streakData: StreakData = response.data.data;
      setStreak(streakData.streak);
      
      // Generate mock history for visualization (last 14 days)
      // In production, this would come from the API
      const mockHistory = generateMockHistory(streakData.streak);
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockHistory = (currentStreak: number): boolean[] => {
    // Generate last 14 days, with current streak being the last N days as success
    const days = [];
    const totalDays = 14;
    const successDays = Math.min(currentStreak, totalDays);
    
    // Fill with failures first
    for (let i = 0; i < totalDays - successDays; i++) {
      days.push(false);
    }
    
    // Add success days at the end (most recent)
    for (let i = 0; i < successDays; i++) {
      days.push(true);
    }
    
    return days;
  };

  const getMotivationalMessage = (streak: number): string => {
    if (streak === 0) return "¡Empieza hoy tu racha de presupuesto!";
    if (streak === 1) return "¡Primer día! Sigue así.";
    if (streak < 3) return "¡Vas por buen camino!";
    if (streak < 7) return "¡Estás construyendo un hábito! 💪";
    if (streak < 14) return "¡Impresionante constancia! 🔥";
    if (streak < 30) return "¡Eres un maestro del presupuesto! 🏆";
    return "¡Leyenda del ahorro! 👑";
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak === 0) return "🌱";
    if (streak < 3) return "🔥";
    if (streak < 7) return "⚡";
    if (streak < 14) return "🚀";
    if (streak < 30) return "👑";
    if (streak < 60) return "💎";
    return "🌟";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main streak display */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl">{getStreakEmoji(streak)}</span>
            </div>
            {streak > 0 && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-base-100">
                {streak}
              </div>
            )}
          </div>
          <p className="mt-3 text-2xl font-bold">
            {streak} {streak === 1 ? 'día' : 'días'}
          </p>
          <p className="text-sm text-base-content/60 mt-1">
            {getMotivationalMessage(streak)}
          </p>
        </div>
      </div>

      {/* History visualization */}
      <div className="space-y-2">
        <p className="text-sm text-base-content/60 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Últimos 14 días
        </p>
        <div className="flex gap-1">
          {history.map((success, index) => (
            <div
              key={index}
              className={`flex-1 h-8 rounded-md flex items-center justify-center transition-all ${
                success 
                  ? 'bg-success/20 text-success' 
                  : 'bg-base-300 text-base-content/30'
              }`}
              title={success ? '¡Día cumplido!' : 'Día no registrado'}
            >
              {success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-base-content/20" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <p className="text-sm font-medium flex items-center gap-1">
          <Target className="w-4 h-4" />
          Próximos objetivos
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[3, 7, 14, 30].map((milestone) => {
            const achieved = streak >= milestone;
            const isNext = !achieved && streak < milestone;
            
            return (
              <div
                key={milestone}
                className={`p-2 rounded-lg text-center transition-all ${
                  achieved
                    ? 'bg-success/10 border border-success/30'
                    : isNext
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-base-200 border border-transparent'
                }`}
              >
                <div className="text-lg mb-0.5">
                  {achieved ? '🏆' : isNext ? '🎯' : '⏳'}
                </div>
                <p className={`text-xs font-medium ${
                  achieved ? 'text-success' : isNext ? 'text-primary' : 'text-base-content/50'
                }`}>
                  {milestone}d
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="alert alert-info text-sm">
        <Trophy className="w-5 h-5" />
        <div>
          <p className="font-medium">¿Cómo mantener la racha?</p>
          <p className="text-xs opacity-80">
            Registra tus gastos diariamente y mantén todas tus categorías dentro del presupuesto.
          </p>
        </div>
      </div>

      {streak === 0 && (
        <div className="text-center">
          <button
            onClick={loadStreak}
            className="btn btn-primary btn-sm"
          >
            <Flame className="w-4 h-4 mr-1" />
            Iniciar racha hoy
          </button>
        </div>
      )}
    </div>
  );
}
