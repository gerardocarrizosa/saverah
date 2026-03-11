'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface DashboardSectionProps {
  sectionId: string;
  title: string;
  icon: React.ReactNode;
  badge?: string | number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  action?: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
}

export function DashboardSection({
  sectionId,
  title,
  icon,
  badge,
  defaultExpanded = true,
  children,
  action,
}: DashboardSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial state from server
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/dashboard/settings');
        const settings = response.data.data;

        // Map section ID to setting key
        const sectionKeyMap: Record<string, string> = {
          'quick-stats': 'quick_stats_expanded',
          'urgent-alerts': 'urgent_alerts_expanded',
          'budget-alerts': 'budget_alerts_expanded',
          'monthly-overview': 'monthly_overview_expanded',
          'recent-activity': 'recent_activity_expanded',
          'savings-goals': 'savings_goals_expanded',
          'budget-streak': 'budget_streak_expanded',
          achievements: 'achievements_expanded',
          'credit-cards': 'credit_cards_expanded',
        };

        const key = sectionKeyMap[sectionId];
        if (key && settings[key] !== undefined) {
          setIsExpanded(settings[key]);
        }
      } catch (error) {
        console.error('Error loading section settings:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, [sectionId]);

  const toggle = useCallback(async () => {
    const newState = !isExpanded;

    // Optimistic update
    setIsExpanded(newState);
    setIsLoading(true);

    try {
      // Map section ID to setting key
      const sectionKeyMap: Record<string, string> = {
        'quick-stats': 'quick_stats_expanded',
        'urgent-alerts': 'urgent_alerts_expanded',
        'budget-alerts': 'budget_alerts_expanded',
        'monthly-overview': 'monthly_overview_expanded',
        'recent-activity': 'recent_activity_expanded',
        'savings-goals': 'savings_goals_expanded',
        'budget-streak': 'budget_streak_expanded',
        achievements: 'achievements_expanded',
        'credit-cards': 'credit_cards_expanded',
      };

      const key = sectionKeyMap[sectionId];
      if (key) {
        await api.patch('/dashboard/settings', {
          [key]: newState,
        });
      }
    } catch (error) {
      // Rollback on error
      setIsExpanded(!newState);
      console.error('Error saving section state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isExpanded, sectionId]);

  // Don't render until initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="card bg-base-100 shadow-xl animate-pulse">
        <div className="card-body">
          <div className="h-8 bg-base-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    // <div className="card bg-base-100 shadow-xl border">
    <div className="card bg-base-100 shadow border border-base-300 rounded-xl">
      <div className="card-body p-0">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-200/50 transition-colors"
          onClick={toggle}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div className="flex items-center gap-2">
              <h2 className="card-title text-lg m-0">{title}</h2>
              {badge !== undefined && badge !== 0 && (
                <span className="badge badge-primary badge-sm">{badge}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {action && (
              <a
                href={action.href}
                className="btn btn-ghost btn-sm gap-1 hidden sm:flex"
                onClick={(e) => e.stopPropagation()}
              >
                {action.icon}
                {action.label}
              </a>
            )}
            <button
              className="btn btn-ghost btn-sm btn-circle"
              disabled={isLoading}
              aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
