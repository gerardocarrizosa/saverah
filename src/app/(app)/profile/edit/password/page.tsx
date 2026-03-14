import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PasswordChangeForm } from '@/components/user/PasswordChangeForm';

export default async function PasswordChangePage() {
  const supabase = await createSupabaseServerClient();
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }
  
  return <PasswordChangeForm />;
}
