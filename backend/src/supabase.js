import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const url = config.supabaseUrl || 'https://placeholder.supabase.co';
const key = config.supabaseServiceRoleKey || config.supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
