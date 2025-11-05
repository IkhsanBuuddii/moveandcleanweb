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
  status TEXT DEFAULT 'pending',
  total REAL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(vendor_id) REFERENCES vendors(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);
`);

export default db;
