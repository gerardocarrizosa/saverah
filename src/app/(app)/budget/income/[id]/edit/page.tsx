import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { EditIncomeForm } from '@/components/budget/EditIncomeForm';

interface EditIncomePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditIncomePage({ params }: EditIncomePageProps) {
  const { id } = await params;
  
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the income
  const { data: income, error } = await supabase
    .from('income')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !income) {
    notFound();
  }

  return <EditIncomeForm income={income} />;
}
