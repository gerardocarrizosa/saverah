import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getRemindersWithPaymentStatus } from '@/lib/api/remindersWithPayments';
import { getBudgetSummary } from '@/lib/api/budget';
import { getRecentActivity } from '@/lib/api/recentActivity';
import { redirect } from 'next/navigation';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { BudgetOverviewCard } from '@/components/dashboard/BudgetOverviewCard';
import { UpcomingRemindersCard } from '@/components/dashboard/UpcomingRemindersCard';
import { QuickActionsBanner } from '@/components/dashboard/QuickActionsBanner';
import { WealthStream } from '@/components/dashboard/WealthStream';

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

  return (
    <main className="space-y-10">
      {/* Hero: Total Balance */}
      <DashboardHero balance={budget.balance} />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Budget Overview Card */}
        <div className="md:col-span-7">
          <BudgetOverviewCard
            totalIncome={budget.total_income}
            totalExpenses={budget.total_expenses}
            balance={budget.balance}
          />
        </div>

        {/* Reminders Card */}
        <div className="md:col-span-5">
          <UpcomingRemindersCard reminders={reminders} />
        </div>

        {/* Quick Actions Banner */}
        <QuickActionsBanner />
      </div>

      {/* Recent Activity */}
      <WealthStream activities={recentActivity} />
    </main>
  );
}
