import { createSupabaseServerClient } from '../supabase/server';
import type { UserProfile, UpdateProfileData, ChangePasswordData } from '@/types/user.types';

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || null,
    phone: user.user_metadata?.phone || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at || null,
  };
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  
  // Create unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });
  
  if (uploadError) {
    throw new Error('Error al subir la imagen: ' + uploadError.message);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  return publicUrl;
}

export async function updateUserProfile(
  data: UpdateProfileData
): Promise<UserProfile> {
  const supabase = await createSupabaseServerClient();
  
  // Update user metadata and email
  const updates: {
    data: {
      full_name?: string;
      phone?: string;
      avatar_url?: string;
    };
    email?: string;
  } = {
    data: {
      full_name: data.full_name,
      phone: data.phone,
      avatar_url: data.avatar_url,
    },
  };
  
  if (data.email) {
    updates.email = data.email;
  }
  
  const { data: { user }, error } = await supabase.auth.updateUser(updates);
  
  if (error) throw error;
  if (!user) throw new Error('Failed to update user profile');
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || null,
    phone: user.user_metadata?.phone || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at || null,
  };
}

export async function changeUserPassword(
  data: ChangePasswordData
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // First verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email || '',
    password: data.current_password,
  });
  
  if (signInError) {
    throw new Error('La contraseña actual es incorrecta');
  }
  
  // Update password
  const { error } = await supabase.auth.updateUser({
    password: data.new_password,
  });
  
  if (error) throw error;
}
