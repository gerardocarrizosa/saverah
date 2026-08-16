import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getIncome,
  getMonthRange,
  isMonthFormatError,
} from "@/lib/api/budget";
import { IncomePageContent } from "@/components/budget/IncomePageContent";
import { redirect } from "next/navigation";
import type { Income } from "@/types/budget.types";

interface IncomeInsights {
  total: number;
  count: number;
  steadyCount: number;
  variableCount: number;
}

function calculateInsights(income: Income[]): IncomeInsights {
  const total = income.reduce((sum, item) => sum + item.amount, 0);
  const count = income.length;
  const steadyCount = income.filter((item) => item.type === "steady").length;
  const variableCount = income.filter((item) => item.type === "variable").length;

  return {
    total,
    count,
    steadyCount,
    variableCount,
  };
}

interface IncomePageProps {
  searchParams?: Promise<{ month?: string }>;
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedMonth = resolvedSearchParams?.month;
  let monthContext = getMonthRange().month;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Direct DB call for SSR - no HTTP round-trip
  let income: Income[];
  try {
    monthContext = getMonthRange(selectedMonth).month;
    income = await getIncome(user.id, selectedMonth);
  } catch (error) {
    if (!isMonthFormatError(error)) throw error;
    monthContext = getMonthRange().month;
    income = await getIncome(user.id);
  }

  // Calculate insights server-side
  const insights = calculateInsights(income);

  return (
    <main>
      <IncomePageContent
        income={income}
        insights={insights}
        selectedMonth={monthContext}
      />
    </main>
  );
}
