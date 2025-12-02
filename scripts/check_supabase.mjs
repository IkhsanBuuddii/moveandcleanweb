import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function count(table) {
  const { data, error, count } = await supabase.from(table).select('id', { count: 'exact' });
  if (error) {
    console.error(`Error counting ${table}:`, error.message || error);
    return null;
  }
  return count;
}

async function sampleOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(email), services(title), vendors(vendor_name)')
    .limit(1)
    .single();
  if (error) return { error };
  return data;
}

async function run() {
  console.log('Checking Supabase at', SUPABASE_URL);
  const tables = ['users', 'vendors', 'services', 'orders', 'order_messages'];
  for (const t of tables) {
    const c = await count(t);
    console.log(`${t}:`, c === null ? 'error' : c);
  }

  const sample = await sampleOrder();
  console.log('\nSample order row:');
  console.log(sample);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
