import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Pastikan path absolut ke folder backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "moveandclean.db");

console.log("🗂️  Database path:", dbPath); // debug info

const db = new Database(dbPath);

// Buat tabel kalau belum ada
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vendor_name TEXT,
  description TEXT,
  location TEXT,
  rating REAL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  title TEXT,
  price REAL,
  duration TEXT,
  category TEXT,
  FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vendor_id INTEGER,
  service_id INTEGER,
  date TEXT,
  scheduled_at TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  total REAL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(vendor_id) REFERENCES vendors(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS order_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  sender_id INTEGER,
  text TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(sender_id) REFERENCES users(id)
);
`);

export default db;
// Ensure older DBs get new columns if missing
try {
  const cols = db.prepare("PRAGMA table_info('orders')").all().map((c) => c.name)
  if (!cols.includes('scheduled_at')) {
    db.prepare("ALTER TABLE orders ADD COLUMN scheduled_at TEXT").run()
  }
  if (!cols.includes('notes')) {
    db.prepare("ALTER TABLE orders ADD COLUMN notes TEXT").run()
  }
} catch (err) {
  console.warn('Error ensuring orders columns:', err.message)
}
