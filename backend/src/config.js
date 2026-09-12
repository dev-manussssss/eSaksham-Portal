import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabaseUrl: process.env.SUPABASE_URL || 'https://udsekdvgowpwgpujbgsl.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkc2VrZHZnb3dwd2dwdWpiZ3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTc4MDcsImV4cCI6MjEwNDczMzgwN30.4wTlVrFeFXjGVXo9KtvSQU24FXa39_z_6ZCHtGwZx6E',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  groqKey1: process.env.GROQ_API_KEY_1 || '',
  groqKey2: process.env.GROQ_API_KEY_2 || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  uploadsDir: path.resolve(__dirname, '../uploads'),
};
