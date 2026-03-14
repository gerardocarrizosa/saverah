export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export type UpdateProfileData = {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  email?: string;
};

export type ChangePasswordData = {
  current_password: string;
  new_password: string;
};
