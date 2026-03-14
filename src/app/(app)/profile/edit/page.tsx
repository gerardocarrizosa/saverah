import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/api/user';
import { ProfileEditForm } from '@/components/user/ProfileEditForm';

export default async function ProfileEditPage() {
  const supabase = await createSupabaseServerClient();
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }
  
  // Get user profile data
  const userProfile = await getCurrentUserProfile();
  
  if (!userProfile) {
    redirect('/login');
  }
  
  return <ProfileEditForm user={userProfile} />;
}
