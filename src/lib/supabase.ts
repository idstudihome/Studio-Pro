import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Local fallback storage keys
export const STORAGE_KEYS = {
  USER: 'studio_pro_user',
  ACCOUNTS: 'studio_pro_accounts',
  STORYBOARDS: 'studio_pro_storyboards',
  CUSTOM_API_KEY: 'studio_pro_gemini_key',
  SETTINGS: 'studio_pro_settings',
  ADMIN_TOOLS: 'studio_pro_admin_tools',
  ADMIN_PRODUCTS: 'studio_pro_admin_products',
  ADMIN_COURSES: 'studio_pro_admin_courses',
  ADMIN_TRANSACTIONS: 'studio_pro_admin_transactions',
  ADMIN_LOGS: 'studio_pro_admin_logs',
};
