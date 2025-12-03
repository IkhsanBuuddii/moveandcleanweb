import { createClient } from '@supabase/supabase-js'

// Frontend Supabase client — uses anon key only (safe for browser)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase client may not work in browser.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
