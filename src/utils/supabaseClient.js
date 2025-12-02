import { createClient } from '@supabase/supabase-js';

// Frontend client — use Vite env vars so keys don't get committed.
// Set these in your development environment (see README) as:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://etbgizjdqqhhxyrfnpvs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '<REPLACE_WITH_ANON_KEY>';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
