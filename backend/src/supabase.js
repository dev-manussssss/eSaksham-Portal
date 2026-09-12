import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
export const supabase = createClient(config.supabaseUrl, key, {
  auth: { persistSession: false },
});
