import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminders } from '@/lib/api/reminders';
import { getBudgetSummary } from '@/lib/api/budget';
import { ArrowRight, Activity, Target, Flame, Trophy, CreditCard } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { QuickStatsRow } from '@/components/dashboard/QuickStatsRow';
import { UrgentAlerts } from '@/components/dashboard/UrgentAlerts';
import { BudgetAlerts } from '@/components/dashboard/BudgetAlerts';
import { MonthlyOverview } from '@/components/dashboard/MonthlyOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SavingsGoals } from '@/components/dashboard/SavingsGoals';
import { BudgetStreak } from '@/components/dashboard/BudgetStreak';
import { Achievements } from '@/components/dashboard/Achievements';
import { CreditCardsQuickView } from '@/components/dashboard/CreditCardsQuickView';
import { 
  LayoutDashboard,
  Zap,
  AlertTriangle,
  PiggyBank,
  CalendarDays
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [reminders, budget] = await Promise.all([
    getReminders(user.id),
    getBudgetSummary(user.id),
  ]);

  const activeReminders = reminders.filter((r) => r.is_active);
  
  // Calculate urgent count (sync version for server component)
  const urgentCount = activeReminders.filter((r) => {
    // Simple calculation: due_day close to today
    const today = new Date().getDate();
    const diff = Math.abs(r.due_day - today);
    return diff <= 3 || (r.due_day >= 28 && today <= 3); // Handle month boundary
  }).length;

  // Count budget alerts for badge
  const alertCount = budget.categories.filter(
    (cat) => cat.limit && (cat.percentage || 0) >= 80
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Panel de control
          </h1>
          <p className="text-base-content/70 mt-1">
            Resumen de tus finanzas personales
          </p>
        </div>
      </div>

      {/* Main Stats - Always Visible */}
      <DashboardStats 
        balance={budget.balance}
        totalIncome={budget.total_income}
        totalExpenses={budget.total_expenses}
      />

      {/* Quick Stats Row */}
      <DashboardSection
        sectionId="quick-stats"
        title="Estadísticas rápidas"
        icon={<Zap className="w-5 h-5" />}
        defaultExpanded={true}
      >
        <QuickStatsRow budget={budget} />
      </DashboardSection>

      {/* Urgent Alerts */}
      <DashboardSection
        sectionId="urgent-alerts"
        title="Pagos urgentes"
        icon={<AlertTriangle className="w-5 h-5" />}
        badge={urgentCount > 0 ? urgentCount : undefined}
        defaultExpanded={urgentCount > 0}
        action={{
          label: 'Ver todos',
          href: '/reminders',
          icon: <ArrowRight className="w-4 h-4" />
        }}
      >
        <Suspense fallback={<div className="loading loading-spinner"></div>}>
          <UrgentAlerts reminders={reminders} />
        </Suspense>
      </DashboardSection>

      {/* Budget Alerts */}
      <DashboardSection
        sectionId="budget-alerts"
        title="Alertas de presupuesto"
        icon={<PiggyBank className="w-5 h-5" />}
        badge={alertCount > 0 ? alertCount : undefined}
        defaultExpanded={alertCount > 0}
        action={{
          label: 'Ver presupuesto',
          href: '/budget',
          icon: <ArrowRight className="w-4 h-4" />
        }}
      >
        <BudgetAlerts categories={budget.categories} />
      </DashboardSection>

      {/* Credit Cards Quick View - Phase 4 */}
      <DashboardSection
        sectionId="credit-cards"
        title="Tarjetas de crédito"
        icon={<CreditCard className="w-5 h-5" />}
        defaultExpanded={true}
      >
        <Suspense fallback={<div className="loading loading-spinner"></div>}>
          <CreditCardsQuickView />
        </Suspense>
      </DashboardSection>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Overview */}
        <DashboardSection
          sectionId="monthly-overview"
          title="Resumen mensual"
          icon={<CalendarDays className="w-5 h-5" />}
          defaultExpanded={true}
        >
          <Suspense fallback={<div className="loading loading-spinner"></div>}>
            <MonthlyOverview 
              currentBudget={budget} 
            />
          </Suspense>
        </DashboardSection>

        {/* Recent Activity */}
        <DashboardSection
          sectionId="recent-activity"
          title="Actividad reciente"
          icon={<Activity className="w-5 h-5" />}
          action={{
            label: 'Ver todo',
            href: '/budget',
            icon: <ArrowRight className="w-4 h-4" />
          }}
        >
          <Suspense fallback={<div className="loading loading-spinner"></div>}>
            <RecentActivity />
          </Suspense>
        </DashboardSection>
      </div>

      {/* Three Column Layout - Phase 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Goals */}
        <DashboardSection
          sectionId="savings-goals"
          title="Meta de ahorro"
          icon={<Target className="w-5 h-5" />}
          defaultExpanded={true}
        >
          <SavingsGoals budget={budget} />
        </DashboardSection>

        {/* Budget Streak */}
        <DashboardSection
          sectionId="budget-streak"
          title="Racha de presupuesto"
          icon={<Flame className="w-5 h-5" />}
          defaultExpanded={true}
        >
          <BudgetStreak />
        </DashboardSection>

        {/* Achievements */}
        <DashboardSection
          sectionId="achievements"
          title="Logros"
          icon={<Trophy className="w-5 h-5" />}
          defaultExpanded={true}
        >
          <Achievements />
        </DashboardSection>
      </div>
    </div>
  );
}
