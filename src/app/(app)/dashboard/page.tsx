import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getRemindersWithPaymentStatus } from '@/lib/api/remindersWithPayments';
import { getBudgetSummary } from '@/lib/api/budget';
import { getRecentActivity } from '@/lib/api/recentActivity';
import {
  ArrowRight,
  Activity,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { QuickStatsRow } from '@/components/dashboard/QuickStatsRow';
import { UrgentAlerts } from '@/components/dashboard/UrgentAlerts';
import { BudgetAlerts } from '@/components/dashboard/BudgetAlerts';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  LayoutDashboard,
  Zap,
  AlertTriangle,
  PiggyBank,
} from 'lucide-react';
import { VisibilityToggle } from '@/components/budget/VisibilityToggle';

/**
 * DASHBOARD DESIGN INTENT
 *
 * Who: Personal finance users checking their daily snapshot
 * What: Quickly see balance, urgent payments, budget status, recent activity
 * Feel: Calm, trustworthy, organized - financial data can be stressful,
 *       so the interface must feel approachable and never overwhelming
 *
 * Mobile-first approach with:
 * - Stacked sections for easy thumb-scrolling
 * - Clear visual hierarchy with subtle depth
 * - Consistent spacing scale (4px base unit)
 * - Minimal, purposeful color use
 * - Functional states for all interactions
 */

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [reminders, budget, recentActivity] = await Promise.all([
    getRemindersWithPaymentStatus(user.id),
    getBudgetSummary(user.id),
    getRecentActivity(user.id, 5),
  ]);

  const activeReminders = reminders.filter((r) => r.is_active);

  // Calculate urgent count (excluding already paid reminders)
  const urgentCount = activeReminders.filter((r) => {
    // Skip if already paid for current cycle
    if (r.isPaidForCurrentCycle) return false;
    
    // Simple calculation: due_day close to today
    const today = new Date().getDate();
    const diff = Math.abs(r.due_day - today);
    return diff <= 3 || (r.due_day >= 28 && today <= 3); // Handle month boundary
  }).length;

  // Count budget alerts for badge
  const alertCount = budget.categories.filter(
    (cat) => cat.limit && (cat.percentage || 0) >= 80,
  ).length;

  return (
    <div className="min-h-screen">
      {/* 
        Main content wrapper
        - max-w-4xl: Keeps content readable on large screens
        - mx-auto: Centers the content
        - px-4 sm:px-6: Mobile-first padding (16px mobile, 24px tablet+)
        - py-4 sm:py-6: Vertical breathing room
        - space-y-6: Consistent 24px spacing between major sections
      */}
      <main className="mx-auto p-4 space-y-6">
        {/* 
          Header Section
          - Simple greeting with clear hierarchy
          - Mobile: Icon + Title stacked vertically feels more natural
          - Tablet+: Horizontal layout with proper spacing
        */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-base-content">
              Panel de control
            </h1>
          </div>
          <VisibilityToggle />
        </header>

        {/* 
          1. Main Stats - Always Visible (Priority: High)
          - Full width card with subtle border
          - Large, scannable numbers for mobile
          - Clear visual separation between balance, income, expenses
        */}
        <section className="rounded-xl border border-base-300 bg-base-100 p-4 shadow">
          <DashboardStats
            balance={budget.balance}
            totalIncome={budget.total_income}
            totalExpenses={budget.total_expenses}
          />
        </section>

        {/* 
          2. Quick Stats Row (Priority: High)
          - Compact metrics in a row
          - Mobile: 2x2 grid for easy thumb reach
          - Tablet+: Horizontal row
        */}
        <DashboardSection
          sectionId="quick-stats"
          title="Estadísticas rápidas"
          icon={<Zap className="w-4 h-4" />}
          defaultExpanded={true}
        >
          <QuickStatsRow budget={budget} />
        </DashboardSection>

        {/* 
          3. Urgent Alerts (Priority: Critical)
          - Auto-expanded when there are alerts
          - Clear visual indicator with badge
          - Action button for quick navigation
        */}
        <DashboardSection
          sectionId="urgent-alerts"
          title="Pagos urgentes"
          icon={<AlertTriangle className="w-4 h-4" />}
          badge={urgentCount > 0 ? urgentCount : undefined}
          defaultExpanded={urgentCount > 0}
          action={{
            label: 'Ver todos',
            href: '/reminders',
            icon: <ArrowRight className="w-4 h-4" />,
          }}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md" />
              </div>
            }
          >
            <UrgentAlerts reminders={reminders} />
          </Suspense>
        </DashboardSection>

        {/* 
          Two Column Layout: Budget Alerts + Recent Activity
          - Mobile: Stack vertically (grid-cols-1)
          - Tablet+: Side by side (lg:grid-cols-2)
          - gap-4 on mobile, gap-6 on larger screens
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 4. Budget Alerts (Priority: High) */}
          <DashboardSection
            sectionId="budget-alerts"
            title="Alertas de presupuesto"
            icon={<PiggyBank className="w-4 h-4" />}
            badge={alertCount > 0 ? alertCount : undefined}
            defaultExpanded={alertCount > 0}
            action={{
              label: 'Ver presupuesto',
              href: '/budget',
              icon: <ArrowRight className="w-4 h-4" />,
            }}
          >
            <BudgetAlerts categories={budget.categories} />
          </DashboardSection>

          {/* 5. Recent Activity (Priority: Medium-High) */}
          <DashboardSection
            sectionId="recent-activity"
            title="Actividad reciente"
            icon={<Activity className="w-4 h-4" />}
            action={{
              label: 'Ver todo',
              href: '/budget',
              icon: <ArrowRight className="w-4 h-4" />,
            }}
          >
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md" />
              </div>
            }
          >
            <RecentActivity initialData={recentActivity} />
          </Suspense>
          </DashboardSection>
        </div>

        {/* 
          OPTIONAL COMPONENTS - Hidden for now
          Will be configurable via user settings in future
          
          Components removed from main view:
          - CreditCardsQuickView (Phase 4)
          - MonthlyOverview 
          - SavingsGoals (Meta de ahorro)
          - BudgetStreak (Racha de presupuesto)
          - Achievements (Logros)
        */}

        {/* Credit Cards Quick View - Phase 4 (Optional) */}
        {/*
        <DashboardSection
          sectionId="credit-cards"
          title="Tarjetas de crédito"
          icon={<CreditCard className="w-4 h-4" />}
          defaultExpanded={true}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="loading loading-spinner loading-md" />
            </div>
          }>
            <CreditCardsQuickView />
          </Suspense>
        </DashboardSection>
        */}

        {/* Two Column Layout - Optional */}
        {/*
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <DashboardSection
            sectionId="monthly-overview"
            title="Resumen mensual"
            icon={<CalendarDays className="w-4 h-4" />}
            defaultExpanded={true}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md" />
              </div>
            }>
              <MonthlyOverview currentBudget={budget} />
            </Suspense>
          </DashboardSection>
        </div>
        */}

        {/* Three Column Layout - Phase 3 (Optional) */}
        {/*
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <DashboardSection
            sectionId="savings-goals"
            title="Meta de ahorro"
            icon={<Target className="w-4 h-4" />}
            defaultExpanded={true}
          >
            <SavingsGoals budget={budget} />
          </DashboardSection>

          <DashboardSection
            sectionId="budget-streak"
            title="Racha de presupuesto"
            icon={<Flame className="w-4 h-4" />}
            defaultExpanded={true}
          >
            <BudgetStreak />
          </DashboardSection>

          <DashboardSection
            sectionId="achievements"
            title="Logros"
            icon={<Trophy className="w-4 h-4" />}
            defaultExpanded={true}
          >
            <Achievements />
          </DashboardSection>
        </div>
        */}
      </main>
    </div>
  );
}
