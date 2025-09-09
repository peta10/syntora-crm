import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database';

// For static export builds (Tauri), we need to handle environment variables properly
// These are public keys anyway, so it's safe to include fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qcrgacxgwlpltdfpwkiz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcmdhY3hnd2xwbHRkZnB3a2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNzIxMDAsImV4cCI6MjA2MTc0ODEwMH0.prNKbBkDnNKUE8QRBzU9bnSmRGtTRV8bf4o2RhQAKg8';

let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL or anonymous key is missing');
      }

      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });

    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw error;
    }
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient(); 