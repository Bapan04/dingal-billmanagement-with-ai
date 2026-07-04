import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
  console.warn('WARNING: Supabase URL and Key are not properly configured in .env');
}

const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseKey || 'placeholder');

export default supabase;
