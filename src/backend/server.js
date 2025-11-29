// backend/server.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP + Socket.IO server
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('join_vendor', (vendorId) => {
    socket.join(`vendor:${vendorId}`);
  });

  socket.on('join_order', (orderId) => {
    socket.join(`order:${orderId}`);
  });

  socket.on('disconnect', () => {
    // console.log('Socket disconnected', socket.id)
  });
});

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
  if (!vendor_id || !title) return res.status(400).json({ message: 'vendor_id and title required' });
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(vendor_id);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  const stmt = db.prepare(
    "INSERT INTO services (vendor_id, title, price, duration, category) VALUES (?, ?, ?, ?, ?)"
  );
  const info = stmt.run(vendor_id, title, price, duration, category);
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid);
  res.json(service);
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

// ✅ VENDOR CRUD
app.post('/api/vendors', (req, res) => {
  const { user_id, vendor_name, description, location } = req.body;
  if (!user_id || !vendor_name) return res.status(400).json({ message: 'user_id and vendor_name required' });

  const existing = db.prepare('SELECT * FROM vendors WHERE user_id = ?').get(user_id);
  if (existing) return res.status(400).json({ message: 'User already has vendor profile' });

  const stmt = db.prepare('INSERT INTO vendors (user_id, vendor_name, description, location) VALUES (?, ?, ?, ?)');
  const info = stmt.run(user_id, vendor_name, description || null, location || null);
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(info.lastInsertRowid);

  // upgrade user role to vendor
  db.prepare("UPDATE users SET role = 'vendor' WHERE id = ?").run(user_id);

  res.json(vendor);
});

app.get('/api/vendors', (req, res) => {
  const vendors = db.prepare('SELECT v.*, u.email FROM vendors v LEFT JOIN users u ON v.user_id = u.id').all();
  res.json(vendors);
});

app.get('/api/vendors/:id', (req, res) => {
  const vendor = db.prepare('SELECT v.*, u.email FROM vendors v LEFT JOIN users u ON v.user_id = u.id WHERE v.id = ?').get(req.params.id);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json(vendor);
});

// GET services by vendor
app.get('/api/vendors/:vendorId/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services WHERE vendor_id = ?').all(req.params.vendorId);
  res.json(services);
});

// Update service
app.put('/api/services/:id', (req, res) => {
  const { title, price, duration, category } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE services SET title = ?, price = ?, duration = ?, category = ? WHERE id = ?');
  const info = stmt.run(title, price, duration, category, id);
  if (info.changes === 0) return res.status(404).json({ message: 'Service not found' });
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  res.json(service);
});

// Delete service
app.delete('/api/services/:id', (req, res) => {
  const id = req.params.id;
  const info = db.prepare('DELETE FROM services WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ message: 'Service not found' });
  res.json({ success: true });
});

// ✅ BUAT ORDER
app.post("/api/orders", (req, res) => {
  const { user_id, vendor_id, service_id, total, scheduled_at, notes } = req.body;

  if (!user_id || !vendor_id || !service_id) {
    return res.status(400).json({ message: 'user_id, vendor_id and service_id are required' });
  }

  const stmt = db.prepare(
    `INSERT INTO orders (user_id, vendor_id, service_id, date, scheduled_at, notes, total, status) VALUES (?, ?, ?, datetime('now'), ?, ?, ?, 'pending')`
  );
  const info = stmt.run(user_id, vendor_id, service_id, scheduled_at || null, notes || null, total || 0);
  const orderId = info.lastInsertRowid;

  const order = db.prepare('SELECT o.*, s.title, v.vendor_name FROM orders o JOIN services s ON o.service_id = s.id JOIN vendors v ON o.vendor_id = v.id WHERE o.id = ?').get(orderId);

  // notify vendor room about new order
  io.to(`vendor:${vendor_id}`).emit('new_order', order);
  io.to(`order:${orderId}`).emit('order_created', order);

  res.json({ success: true, order });
});

// Get order by id
app.get('/api/orders/order/:id', (req, res) => {
  const order = db.prepare('SELECT o.*, s.title, v.vendor_name FROM orders o JOIN services s ON o.service_id = s.id JOIN vendors v ON o.vendor_id = v.id WHERE o.id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// messages for an order
app.get('/api/orders/:orderId/messages', (req, res) => {
  const msgs = db.prepare('SELECT m.*, u.name as sender_name FROM order_messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.order_id = ? ORDER BY m.created_at ASC').all(req.params.orderId);
  res.json(msgs);
});

app.post('/api/orders/:orderId/messages', (req, res) => {
  const { sender_id, text } = req.body;
  const orderId = req.params.orderId;
  if (!sender_id || !text) return res.status(400).json({ message: 'sender_id and text required' });
  const info = db.prepare('INSERT INTO order_messages (order_id, sender_id, text) VALUES (?, ?, ?)').run(orderId, sender_id, text);
  const msg = db.prepare('SELECT m.*, u.name as sender_name FROM order_messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.id = ?').get(info.lastInsertRowid);

  // emit to order room
  io.to(`order:${orderId}`).emit('order_message', msg);
  res.json(msg);
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
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`✅ API + Socket.IO server running at http://localhost:${PORT}`));
