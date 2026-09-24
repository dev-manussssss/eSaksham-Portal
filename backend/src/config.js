import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  groqKey1: process.env.GROQ_API_KEY_1 || '',
  groqKey2: process.env.GROQ_API_KEY_2 || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  uploadsDir: path.resolve(__dirname, '../uploads'),
};
