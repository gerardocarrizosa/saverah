'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Loader2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import type { Reminder } from '@/types/reminder.types';

interface CreditCardData extends Reminder {
  days_until_due: number;
  days_until_cutoff: number;
  is_overdue: boolean;
  is_cutoff_soon: boolean;
  is_paid_this_month: boolean;
  last_payment_amount?: number;
  estimated_payment?: number;
}

export function CreditCardsQuickView() {
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    try {
      // Get reminders and filter those with cutoff_day (credit cards)
      const response = await api.get('/reminders');
      const allReminders: Reminder[] = response.data.data;
      
      // Filter reminders that have cutoff_day (these are credit cards)
      const cardsWithCutoff = allReminders.filter(r => r.cutoff_day !== null && r.cutoff_day !== undefined && r.is_active);
      
      // Fetch analytics for each credit card to get cutoff info
      const cardsWithAnalytics = await Promise.all(
        cardsWithCutoff.map(async (card) => {
          try {
            const analyticsRes = await api.get(`/analytics/reminders/${card.id}`);
            const analytics = analyticsRes.data.data;
            
            // Calculate if paid this month
            const today = new Date();
            const isPaidThisMonth = analytics.last_paid_at && 
              new Date(analytics.last_paid_at).getMonth() === today.getMonth() &&
              new Date(analytics.last_paid_at).getFullYear() === today.getFullYear();
            
            return {
              ...card,
              days_until_due: analytics.days_until_due,
              days_until_cutoff: analytics.days_until_cutoff || calculateDaysUntilCutoff(card.cutoff_day!),
              is_overdue: analytics.is_overdue,
              is_cutoff_soon: analytics.is_cutoff_soon || false,
              is_paid_this_month: isPaidThisMonth,
              last_payment_amount: analytics.average_payment,
              estimated_payment: analytics.average_payment,
            };
          } catch {
            // If analytics fail, calculate basic info
            return {
              ...card,
              days_until_due: calculateDaysUntilDue(card.due_day),
              days_until_cutoff: calculateDaysUntilCutoff(card.cutoff_day!),
              is_overdue: false,
              is_cutoff_soon: calculateDaysUntilCutoff(card.cutoff_day!) <= 3,
              is_paid_this_month: false,
              estimated_payment: 0,
            };
          }
        })
      );
      
      // Sort by urgency: cutoff soon first, then due soon
      const sortedCards = cardsWithAnalytics.sort((a, b) => {
        // Prioritize cards that haven't been paid
        if (a.is_paid_this_month !== b.is_paid_this_month) {
          return a.is_paid_this_month ? 1 : -1;
        }
        // Then by cutoff urgency
        if (a.is_cutoff_soon !== b.is_cutoff_soon) {
          return a.is_cutoff_soon ? -1 : 1;
        }
        // Then by days until cutoff
        return a.days_until_cutoff - b.days_until_cutoff;
      });
      
      setCreditCards(sortedCards);
    } catch (error) {
      console.error('Error loading credit cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysUntilDue = (dueDay: number): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
    if (nextDue < today) {
      nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
    }
    return Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateDaysUntilCutoff = (cutoffDay: number): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextCutoff = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
    if (nextCutoff < today) {
      nextCutoff = new Date(today.getFullYear(), today.getMonth() + 1, cutoffDay);
    }
    return Math.ceil((nextCutoff.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return '—';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (card: CreditCardData) => {
    if (card.is_paid_this_month) return 'success';
    if (card.is_overdue) return 'error';
    if (card.is_cutoff_soon) return 'warning';
    return 'info';
  };

  const getStatusMessage = (card: CreditCardData) => {
    if (card.is_paid_this_month) return 'Pagada este mes';
    if (card.is_overdue) return `Venció hace ${Math.abs(card.days_until_due)} días`;
    if (card.is_cutoff_soon) return `Corte en ${card.days_until_cutoff} días`;
    if (card.days_until_cutoff <= 7) return `Corte en ${card.days_until_cutoff} días`;
    return `Corte en ${card.days_until_cutoff} días`;
  };

  const getCardEmoji = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('visa')) return '💳';
    if (lowerName.includes('mastercard') || lowerName.includes('master')) return '💳';
    if (lowerName.includes('amex') || lowerName.includes('american')) return '💳';
    if (lowerName.includes('citi') || lowerName.includes('citibanamex')) return '🏦';
    if (lowerName.includes('bbva')) return '🏦';
    if (lowerName.includes('santander')) return '🏦';
    if (lowerName.includes('hsbc')) return '🏦';
    if (lowerName.includes('banorte')) return '🏦';
    if (lowerName.includes(' Scotiabank')) return '🏦';
    return '💳';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (creditCards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <p className="text-base-content/70 mb-2">No tienes tarjetas de crédito registradas</p>
        <p className="text-sm text-base-content/50 mb-4">
          Agrega tarjetas con fecha de corte para verlas aquí
        </p>
        <Link href="/reminders/new" className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4 mr-1" />
          Agregar tarjeta
        </Link>
      </div>
    );
  }

  const paidCount = creditCards.filter(c => c.is_paid_this_month).length;
  const urgentCount = creditCards.filter(c => !c.is_paid_this_month && c.is_cutoff_soon).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{creditCards.length} tarjeta{creditCards.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-base-content/60">
              {paidCount} pagada{paidCount !== 1 ? 's' : ''} este mes
            </p>
          </div>
        </div>
        {urgentCount > 0 && (
          <div className="badge badge-warning gap-1">
            <AlertTriangle className="w-3 h-3" />
            {urgentCount} corte urgente
          </div>
        )}
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {creditCards.map((card) => {
          const statusColor = getStatusColor(card);
          
          return (
            <Link
              key={card.id}
              href={`/reminders/${card.id}`}
              className="block p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getCardEmoji(card.name)}</div>
                  <div>
                    <p className="font-medium text-sm">{card.name}</p>
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Calendar className="w-3 h-3" />
                      <span>Corte: día {card.cutoff_day}</span>
                      <span className="mx-1">•</span>
                      <span>Pago: día {card.due_day}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {card.estimated_payment ? (
                    <p className="font-semibold text-sm">{formatCurrency(card.estimated_payment)}</p>
                  ) : (
                    <p className="text-sm text-base-content/40">Sin estimación</p>
                  )}
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    statusColor === 'success' ? 'text-success' :
                    statusColor === 'error' ? 'text-error' :
                    statusColor === 'warning' ? 'text-warning' :
                    'text-info'
                  }`}>
                    {card.is_paid_this_month ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : card.is_overdue ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{getStatusMessage(card)}</span>
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {/* Cutoff indicator */}
                  <div 
                    className={`h-1.5 rounded-full flex-1 ${
                      card.days_until_cutoff <= 3 ? 'bg-warning' : 
                      card.days_until_cutoff <= 7 ? 'bg-info' : 'bg-base-300'
                    }`}
                    title={`Corte en ${card.days_until_cutoff} días`}
                  />
                  {/* Due date indicator */}
                  <div 
                    className={`h-1.5 rounded-full flex-1 ${
                      card.is_overdue ? 'bg-error' :
                      card.days_until_due <= 3 ? 'bg-warning' :
                      card.days_until_due <= 7 ? 'bg-info' : 'bg-base-300'
                    }`}
                    title={`Pago en ${card.days_until_due} días`}
                  />
                </div>
                <span className="text-xs text-base-content/40">
                  {card.is_paid_this_month ? '✓' : `${card.days_until_due}d`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-base-300">
        <Link
          href="/reminders"
          className="btn btn-ghost btn-sm gap-1"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/reminders/new" className="btn btn-sm btn-primary">
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Link>
      </div>
    </div>
  );
}
