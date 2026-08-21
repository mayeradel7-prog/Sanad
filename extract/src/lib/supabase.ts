import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase (resolves VITE_, NEXT_PUBLIC_, and standard SUPABASE_ prefixes from Vercel integration)
const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL;

const rawSupabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  if (!rawSupabaseUrl || !rawSupabaseAnonKey) return false;
  const url = String(rawSupabaseUrl).trim();
  const key = String(rawSupabaseAnonKey).trim();
  if (!url || !key) return false;
  if (
    url === 'MY_SUPABASE_URL' ||
    url === 'YOUR_SUPABASE_URL' ||
    key === 'MY_SUPABASE_ANON_KEY' ||
    key === 'YOUR_SUPABASE_ANON_KEY'
  ) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      !parsed.hostname.includes('placeholder')
    );
  } catch {
    return false;
  }
};

const getSafeUrl = (): string => {
  if (typeof rawSupabaseUrl === 'string' && rawSupabaseUrl.trim().length > 0) {
    try {
      const parsed = new URL(rawSupabaseUrl.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return rawSupabaseUrl.trim();
      }
    } catch {
      // Fall through to placeholder
    }
  }
  return 'https://xyzcompanyplaceholder.supabase.co';
};

const getSafeAnonKey = (): string => {
  if (typeof rawSupabaseAnonKey === 'string' && rawSupabaseAnonKey.trim().length > 0) {
    return rawSupabaseAnonKey.trim();
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder_signature_for_safe_client';
};

// Create the Supabase client instance safely without throwing
export const supabase: SupabaseClient = createClient(
  getSafeUrl(),
  getSafeAnonKey(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Supabase Database Table Schema definitions
 */
export interface SupabaseProfile {
  id: string; // references auth.users
  username: string;
  full_name: string;
  email: string;
  role: 'volunteer' | 'owner' | 'admin';
  avatar_url?: string;
  bio?: string;
  mobile_number?: string;
  owner_status?: 'pending' | 'approved' | 'rejected';
  organization_or_job?: string;
  verification_doc_url?: string;
  verification_doc_name?: string;
  rejection_reason?: string;
  instapay_handle?: string;
  location_city?: string;
  location_district?: string;
  skills?: string[];
  interests?: string[];
  preferred_categories?: string[];
  availability?: string[];
  volunteer_hours?: number;
  completed_tasks_count?: number;
  points?: number;
  badges?: string[];
  ratings_avg?: number;
  ratings_count?: number;
  is_suspended?: boolean;
  privacy_settings?: Record<string, any>;
  blocked_user_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseCategory {
  id: string;
  name_en: string;
  name_ar: string;
  icon: string;
  color: string;
  description_en: string;
  description_ar: string;
  is_active: boolean;
  created_at?: string;
}

export interface SupabaseHelpRequest {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category_id: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  required_skills: string[];
  volunteers_needed: number;
  volunteers_assigned: string[];
  is_donation_requested: boolean;
  donation_goal?: number;
  donation_raised?: number;
  instapay_handle?: string;
  images: string[];
  scheduled_date: string;
  is_recurring: boolean;
  recurring_frequency?: 'weekly' | 'biweekly' | 'monthly';
  status: 'open' | 'volunteer_assigned' | 'in_progress' | 'completed' | 'cancelled';
  saved_by_users: string[];
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseApplication {
  id: string;
  request_id: string;
  volunteer_id: string;
  message: string;
  available_slot: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled_by_volunteer';
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseComment {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

export interface SupabaseConversation {
  id: string;
  participants: string[];
  request_id?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: Record<string, number>;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  is_read: boolean;
  created_at?: string;
}

export interface SupabaseReview {
  id: string;
  request_id: string;
  request_title: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  comment: string;
  tags: string[];
  is_moderated: boolean;
  created_at?: string;
}

export interface SupabaseReport {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'user' | 'message';
  target_id: string;
  target_excerpt?: string;
  reported_user_id?: string;
  reason: 'spam' | 'harassment' | 'fraud' | 'inappropriate' | 'safety' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at?: string;
}

export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: string;
  title_en: string;
  title_ar: string;
  message_en: string;
  message_ar: string;
  link?: string;
  is_read: boolean;
  created_at?: string;
}

export interface SupabasePointLog {
  id: string;
  user_id: string;
  amount: number;
  reason_en: string;
  reason_ar: string;
  type: 'earn' | 'bonus' | 'certificate';
  created_at?: string;
}
