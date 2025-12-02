import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.argv[2];
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY. Provide via env or args.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'moveandclean.db');

console.log('Reading local sqlite DB at', dbPath);
const localDb = new Database(dbPath, { readonly: true });

async function insertAndMap(table, rows, transform) {
  const idMap = new Map();
  for (const r of rows) {
    const payload = transform ? transform(r) : r;
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    if (error) {
      console.error(`Error inserting into ${table}:`, error.message || error);
      continue;
    }
    idMap.set(r.id, data.id);
  }
  return idMap;
}

async function migrate() {
  try {
    // USERS
    const users = localDb.prepare('SELECT id, name, email, password, role FROM users').all();
    console.log(`Found ${users.length} users`);
    const userMap = await insertAndMap('users', users, (u) => ({ name: u.name, email: u.email, password: u.password, role: u.role }));

    // VENDORS
    const vendors = localDb.prepare('SELECT id, user_id, vendor_name, description, location, rating FROM vendors').all();
    console.log(`Found ${vendors.length} vendors`);
    const vendorMap = await insertAndMap('vendors', vendors, (v) => ({ user_id: userMap.get(v.user_id) || null, vendor_name: v.vendor_name, description: v.description, location: v.location, rating: v.rating }));

    // SERVICES
    const services = localDb.prepare('SELECT id, vendor_id, title, price, duration, category FROM services').all();
    console.log(`Found ${services.length} services`);
    const serviceMap = await insertAndMap('services', services, (s) => ({ vendor_id: vendorMap.get(s.vendor_id) || null, title: s.title, price: s.price, duration: s.duration, category: s.category }));

    // ORDERS
    const orders = localDb.prepare('SELECT id, user_id, vendor_id, service_id, date, scheduled_at, notes, status, total FROM orders').all();
    console.log(`Found ${orders.length} orders`);
    const orderMap = await insertAndMap('orders', orders, (o) => ({ user_id: userMap.get(o.user_id) || null, vendor_id: vendorMap.get(o.vendor_id) || null, service_id: serviceMap.get(o.service_id) || null, date: o.date ? new Date(o.date) : null, scheduled_at: o.scheduled_at ? new Date(o.scheduled_at) : null, notes: o.notes || null, status: o.status || 'pending', total: o.total || 0 }));

    // ORDER MESSAGES
    const msgs = localDb.prepare('SELECT id, order_id, sender_id, text, created_at FROM order_messages').all();
    console.log(`Found ${msgs.length} order messages`);
    await insertAndMap('order_messages', msgs, (m) => ({ order_id: orderMap.get(m.order_id) || null, sender_id: userMap.get(m.sender_id) || null, text: m.text, created_at: m.created_at ? new Date(m.created_at) : null }));

    console.log('Migration complete. Check Supabase tables for inserted rows.');
  } catch (err) {
    console.error('Migration error:', err.message || err);
  } finally {
    localDb.close();
  }
}

// Run
migrate();
