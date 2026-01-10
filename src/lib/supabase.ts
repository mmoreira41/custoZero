import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Se não houver credenciais, usar valores dummy para desenvolvimento
const url = supabaseUrl || 'https://dummy.supabase.co';
const key = supabaseAnonKey || 'dummy-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using dummy values for development.');
  console.warn('📝 Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file for full functionality.');
}

export const supabase = createClient(url, key);
