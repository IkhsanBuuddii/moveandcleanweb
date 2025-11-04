// backend/server.js
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ REGISTER (pakai database)
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email dan password wajib diisi" });

  const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existingUser)
    return res.status(400).json({ message: "Email sudah terdaftar" });

  const stmt = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')"
  );
  stmt.run(name, email, password);

  const user = db.prepare("SELECT id, name, email FROM users WHERE email = ?").get(email);
  res.json({ user });
});

// ✅ LOGIN (pakai database)
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare("SELECT id, name, email FROM users WHERE email = ? AND password = ?")
    .get(email, password);

  if (!user) return res.status(401).json({ message: "Email atau password salah" });

  res.json({ user });
});

// ✅ TAMBAH SERVICE (vendor menambahkan layanan)
app.post("/api/services", (req, res) => {
  const { vendor_id, title, price, duration, category } = req.body;
  const stmt = db.prepare(
    "INSERT INTO services (vendor_id, title, price, duration, category) VALUES (?, ?, ?, ?, ?)"
  );
  const info = stmt.run(vendor_id, title, price, duration, category);
  res.json({ id: info.lastInsertRowid });
});

// ✅ AMBIL SEMUA SERVICE
app.get("/api/services", (req, res) => {
  const services = db
    .prepare(`
      SELECT s.*, v.vendor_name 
      FROM services s 
      LEFT JOIN vendors v ON s.vendor_id = v.id
    `)
    .all();
  res.json(services);
});

// ✅ BUAT ORDER
app.post("/api/orders", (req, res) => {
  const { user_id, vendor_id, service_id, total } = req.body;
  const stmt = db.prepare(
    "INSERT INTO orders (user_id, vendor_id, service_id, date, total) VALUES (?, ?, ?, datetime('now'), ?)"
  );
  stmt.run(user_id, vendor_id, service_id, total);
  res.json({ success: true });
});

// ✅ LIHAT ORDER USER
app.get("/api/orders/:userId", (req, res) => {
  const orders = db
    .prepare(`
      SELECT o.*, s.title, v.vendor_name 
      FROM orders o
      JOIN services s ON o.service_id = s.id
      JOIN vendors v ON o.vendor_id = v.id
      WHERE o.user_id = ?
    `)
    .all(req.params.userId);
  res.json(orders);
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("MoveandClean API aktif 🚀");
});

// ✅ START SERVER
app.listen(3000, () => console.log("✅ API server running at http://localhost:3000"));
