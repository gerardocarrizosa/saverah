'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar
} from 'lucide-react';
import api from '@/lib/axios';
import type { ActivityItem } from '@/types/dashboard.types';

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const response = await api.get('/dashboard/recent-activity');
        setActivities(response.data.data);
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, []);

  const formatCurrency = (amount: number, type: ActivityItem['type']) => {
    const formatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
    
    if (type === 'income') return `+${formatted}`;
    if (type === 'expense' || type === 'payment') return `-${formatted}`;
    return formatted;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'expense':
        return <TrendingDown className="w-5 h-5 text-error" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-primary" />;
      default:
        return <Calendar className="w-5 h-5 text-base-content" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'income':
        return 'bg-success/10 text-success';
      case 'expense':
        return 'bg-error/10 text-error';
      case 'payment':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-base-200 text-base-content';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'Ingreso': '💵',
      'Pago de recordatorio': '💳',
      'Vivienda': '🏠',
      'Alimentación': '🍽️',
      'Transporte': '🚗',
      'Servicios': '⚡',
      'Salud': '❤️',
      'Educación': '📚',
      'Entretenimiento': '🎮',
      'Ropa': '👕',
      'Tecnología': '💻',
      'Ahorro': '🐷',
      'Otros': '📦',
    };
    return emojis[category] || '💰';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
        <p className="text-base-content/60">No hay actividad reciente</p>
        <p className="text-sm text-base-content/40 mt-1">
          Registra tus primeros ingresos y gastos
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <Link href="/budget/income" className="btn btn-sm btn-success">
            <Plus className="w-4 h-4" />
            Agregar ingreso
          </Link>
          <Link href="/budget/expenses" className="btn btn-sm btn-error">
            <Plus className="w-4 h-4" />
            Agregar gasto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={`${activity.type}-${activity.id}`}
          className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="text-2xl">
              {getCategoryEmoji(activity.category || '')}
            </div>
            <div>
              <p className="font-medium text-sm">{activity.description}</p>
              <p className="text-xs text-base-content/60 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(activity.date)}
                {activity.category && activity.category !== 'Ingreso' && activity.category !== 'Pago de recordatorio' && (
                  <span className="badge badge-ghost badge-xs ml-1">
                    {activity.category}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`font-semibold ${
              activity.type === 'income' ? 'text-success' : 'text-error'
            }`}>
              {formatCurrency(activity.amount, activity.type)}
            </p>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <Link
          href="/budget"
          className="btn btn-ghost btn-sm gap-1"
        >
          Ver todo el historial
          <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="flex gap-2">
          <Link href="/budget/income" className="btn btn-sm btn-success">
            <Plus className="w-4 h-4" />
            Ingreso
          </Link>
          <Link href="/budget/expenses" className="btn btn-sm btn-error">
            <Plus className="w-4 h-4" />
            Gasto
          </Link>
        </div>
      </div>
    </div>
  );
}
