// backend/server.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import db from "./db.js";
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken'

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
// Use service role key for server-side storage operations
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('🔗 Supabase client initialized');
} else {
  console.log('🔒 Supabase not configured — using local sqlite DB');
}

const app = express();
app.use(cors());
app.use(express.json());
// JWT
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const parts = auth.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const payload = jwt.verify(parts[1], JWT_SECRET)
      req.user = payload
      return next()
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  }
  return res.status(401).json({ message: 'Authorization header missing' })
}

// serve uploaded files
const uploadsDir = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadsDir))

// ensure uploads dir exists
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
} catch (err) {
  console.warn('Could not create uploads dir:', err.message)
}

// multer setup for local file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  }
})
const upload = multer({ storage })

// Create HTTP + Socket.IO server
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  path: '/socket.io',
  cors: {
    origin: [
      'https://moveandcleanweb.vercel.app',
      'http://localhost:5173',
      '*'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

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
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email dan password wajib diisi" });

  // If Supabase configured, use it for user storage
  if (supabase) {
    try {
      const { data: existing, error: existErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);
      if (existErr) return res.status(500).json({ message: existErr.message });
      if (existing && existing.length) return res.status(400).json({ message: 'Email sudah terdaftar' });

      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email, password, role: 'user' }])
        .select('id, name, email, role')
        .single();
      if (error) return res.status(500).json({ message: error.message });
      return res.json({ user: data });
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  // Fallback: local sqlite
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
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('email', email)
        .eq('password', password)
        .limit(1)
        .single();
      if (error) return res.status(401).json({ message: 'Email atau password salah' });
      const token = jwt.sign({ id: data.id, email: data.email, role: data.role }, JWT_SECRET, { expiresIn: '7d' })
      return res.json({ user: data, token });
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const user = db
    .prepare("SELECT id, name, email, role FROM users WHERE email = ? AND password = ?")
    .get(email, password);

  if (!user) return res.status(401).json({ message: "Email atau password salah" });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ user, token });
});

// Image upload endpoint — supports Supabase storage when configured, otherwise stores locally under /uploads
app.post('/api/upload', upload.single('image'), async (req, res) => {
  // if supabase configured, upload to storage bucket 'service-images' (create and configure this bucket separately)
  if (supabase && req.file) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path)
      // upload object key: use the generated filename only (don't double-prefix with bucket name)
      const filename = req.file.filename

      const { data: upData, error: upErr } = await supabase.storage.from('service-images').upload(filename, fileBuffer, { contentType: req.file.mimetype, upsert: true })
      if (upErr) {
        console.error('Supabase upload error', upErr)
        // Common cause: bucket missing or permission denied. Log hint for operator.
        if (upErr.status === 400 || upErr.status === 404) {
          console.warn('Supabase storage bucket "service-images" may not exist or is inaccessible. Create the bucket or unset SUPABASE env vars to use local uploads.')
        }
        // fallback to local URL if supabase upload fails
      } else {
        // try to get public URL for the uploaded object
        const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(filename)
        let publicUrl = urlData?.publicUrl
        let signedUrl = null
        try {
          // also create a signed URL (7 days) for private buckets
          const { data: signedData, error: signedErr } = await supabase.storage.from('service-images').createSignedUrl(filename, 60 * 60 * 24 * 7)
          if (!signedErr) signedUrl = signedData?.signedUrl
        } catch (e) {
          // ignore signed URL failures
        }
        console.log('Supabase upload success:', { key: filename, publicUrl, signedUrl: signedUrl ? '[signed generated]' : null })
        return res.json({ url: publicUrl, signedUrl })
      }
    } catch (err) {
      console.error('Error uploading to supabase', err)
      // fallthrough to serve local file
    }
  }

  // If no supabase or upload failed, return local uploads path (ensure Express static serves it)
  if (req.file) {
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    console.log('Upload saved locally:', { filename: req.file.filename, size: req.file.size, mime: req.file.mimetype, publicUrl })
    return res.json({ url: publicUrl })
  }

  return res.status(400).json({ message: 'No image uploaded' })
})

// ✅ TAMBAH SERVICE (vendor menambahkan layanan)
app.post("/api/services", authMiddleware, async (req, res) => {
  const { vendor_id, title, price, duration, category, image_url } = req.body;
  if (!vendor_id || !title) return res.status(400).json({ message: 'vendor_id and title required' });

  if (supabase) {
    try {
      const { data: vendor, error: vErr } = await supabase.from('vendors').select('*').eq('id', vendor_id).limit(1).single();
      if (vErr || !vendor) return res.status(404).json({ message: 'Vendor not found' });

      const insertObj = { vendor_id, title, price, duration, category };
      if (image_url) insertObj.image_url = image_url;
      const { data, error } = await supabase.from('services').insert([insertObj]).select().single();
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(vendor_id);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  const stmt = db.prepare(
    "INSERT INTO services (vendor_id, title, price, duration, category, image_url) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const info = stmt.run(vendor_id, title, price, duration, category, image_url || null);
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid);
  res.json(service);
});

// ✅ AMBIL SEMUA SERVICE
app.get("/api/services", async (req, res) => {
  if (supabase) {
    try {
      // try to include vendor name via foreign-table select
      const { data, error } = await supabase.from('services').select('*, vendors(vendor_name)');
      if (error) return res.status(500).json({ message: error.message });
      // map vendor nested object to vendor_name for compatibility
      const mapped = data.map(s => ({ ...s, vendor_name: s.vendors ? s.vendors.vendor_name : undefined }));
      return res.json(mapped);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

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
app.post('/api/vendors', authMiddleware, async (req, res) => {
  const { user_id, vendor_name, description, location } = req.body;
  if (!user_id || !vendor_name) return res.status(400).json({ message: 'user_id and vendor_name required' });

  if (supabase) {
    try {
      const { data: existing, error: existErr } = await supabase.from('vendors').select('id').eq('user_id', user_id).limit(1);
      if (existErr) return res.status(500).json({ message: existErr.message });
      if (existing && existing.length) return res.status(400).json({ message: 'User already has vendor profile' });

      // Insert vendor; with RLS or certain PostgREST settings, .single() may not return row
      const { data: inserted, error } = await supabase
        .from('vendors')
        .insert([{ user_id, vendor_name, description: description || null, location: location || null }])
        .select()
        .single();
      if (error) return res.status(500).json({ message: error.message });

      // Ensure we have the inserted vendor row
      let vendorRow = inserted;
      if (!vendorRow) {
        const { data: fetchInserted, error: fetchErr } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user_id)
          .eq('vendor_name', vendor_name)
          .order('id', { ascending: false })
          .limit(1)
          .single();
        if (fetchErr) return res.status(500).json({ message: fetchErr.message });
        vendorRow = fetchInserted;
      }

      // Try to upgrade user role to vendor, but don't fail vendor creation if user missing
      const { error: updErr } = await supabase.from('users').update({ role: 'vendor' }).eq('id', user_id);
      if (updErr) console.warn('User role update failed (non-fatal):', updErr.message);

      // Fetch updated user if exists
      let updatedUser = null;
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', user_id)
        .limit(1)
        .single();
      if (!userErr) updatedUser = userData;

      return res.json({ vendor: vendorRow, user: updatedUser });
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const existing = db.prepare('SELECT * FROM vendors WHERE user_id = ?').get(user_id);
  if (existing) return res.status(400).json({ message: 'User already has vendor profile' });

  const stmt = db.prepare('INSERT INTO vendors (user_id, vendor_name, description, location) VALUES (?, ?, ?, ?)');
  const info = stmt.run(user_id, vendor_name, description || null, location || null);

  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(info.lastInsertRowid);

  // upgrade user role to vendor
  db.prepare("UPDATE users SET role = 'vendor' WHERE id = ?").run(user_id);

  const updatedUser = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(user_id);

  res.json({ vendor, user: updatedUser });
});


app.get('/api/vendors', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('vendors').select('*, users(email)');
      if (error) return res.status(500).json({ message: error.message });
      const mapped = data.map(v => ({ ...v, email: v.users ? v.users.email : undefined }));
      return res.json(mapped);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const vendors = db.prepare('SELECT v.*, u.email FROM vendors v LEFT JOIN users u ON v.user_id = u.id').all();
  res.json(vendors);
});

app.get('/api/vendors/:id', async (req, res) => {
  const id = req.params.id;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('vendors').select('*, users(email)').eq('id', id).limit(1).single();
      if (error || !data) return res.status(404).json({ message: 'Vendor not found' });
      const mapped = { ...data, email: data.users ? data.users.email : undefined };
      return res.json(mapped);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const vendor = db.prepare('SELECT v.*, u.email FROM vendors v LEFT JOIN users u ON v.user_id = u.id WHERE v.id = ?').get(id);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json(vendor);
});

// GET services by vendor
app.get('/api/vendors/:vendorId/services', async (req, res) => {
  const vendorId = req.params.vendorId;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('services').select('*').eq('vendor_id', vendorId);
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const services = db.prepare('SELECT * FROM services WHERE vendor_id = ?').all(vendorId);
  res.json(services);
});

// Update service
app.put('/api/services/:id', authMiddleware, async (req, res) => {
  const { title, price, duration, category, image_url } = req.body;
  const id = req.params.id;
  if (supabase) {
    try {
      const updateObj = { title, price, duration, category };
      if (typeof image_url !== 'undefined') updateObj.image_url = image_url;
      const { data, error } = await supabase.from('services').update(updateObj).eq('id', id).select().single();
      if (error) return res.status(404).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const stmt = db.prepare('UPDATE services SET title = ?, price = ?, duration = ?, category = ?, image_url = ? WHERE id = ?');
  const info = stmt.run(title, price, duration, category, image_url || null, id);
  if (info.changes === 0) return res.status(404).json({ message: 'Service not found' });
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  res.json(service);
});

// Delete service
app.delete('/api/services/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('services').delete().eq('id', id).select();
      if (error) return res.status(404).json({ message: error.message });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const info = db.prepare('DELETE FROM services WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ message: 'Service not found' });
  res.json({ success: true });
});

// ✅ BUAT ORDER
app.post("/api/orders", authMiddleware, async (req, res) => {
  const { user_id, vendor_id, service_id, total, scheduled_at, notes } = req.body;

  if (!user_id || !vendor_id || !service_id) {
    return res.status(400).json({ message: 'user_id, vendor_id and service_id are required' });
  }

  if (supabase) {
    try {
      const insert = {
        user_id,
        vendor_id,
        service_id,
        date: new Date().toISOString(),
        scheduled_at: scheduled_at || null,
        notes: notes || null,
        total: total || 0,
        status: 'pending'
      };
      const { data: orderInserted, error: insErr } = await supabase.from('orders').insert([insert]).select().single();
      if (insErr) return res.status(500).json({ message: insErr.message });

      const orderId = orderInserted.id;
      const { data: order, error: ordErr } = await supabase.from('orders').select('*, services(title), vendors(vendor_name)').eq('id', orderId).limit(1).single();
      if (ordErr) return res.status(500).json({ message: ordErr.message });

      io.to(`vendor:${vendor_id}`).emit('new_order', order);
      io.to(`order:${orderId}`).emit('order_created', order);

      return res.json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
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
app.get('/api/orders/order/:id', async (req, res) => {
  const id = req.params.id;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*, services(title), vendors(vendor_name)').eq('id', id).limit(1).single();
      if (error || !data) return res.status(404).json({ message: 'Order not found' });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const order = db.prepare('SELECT o.*, s.title, v.vendor_name FROM orders o JOIN services s ON o.service_id = s.id JOIN vendors v ON o.vendor_id = v.id WHERE o.id = ?').get(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// messages for an order
app.get('/api/orders/:orderId/messages', async (req, res) => {
  const orderId = req.params.orderId;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('order_messages').select('*, users(name)').eq('order_id', orderId).order('created_at', { ascending: true });
      if (error) return res.status(500).json({ message: error.message });
      const mapped = data.map(m => ({ ...m, sender_name: m.users ? m.users.name : undefined }));
      return res.json(mapped);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const msgs = db.prepare('SELECT m.*, u.name as sender_name FROM order_messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.order_id = ? ORDER BY m.created_at ASC').all(orderId);
  res.json(msgs);
});

app.post('/api/orders/:orderId/messages', async (req, res) => {
  const { sender_id, text } = req.body;
  const orderId = req.params.orderId;
  if (!sender_id || !text) return res.status(400).json({ message: 'sender_id and text required' });

  if (supabase) {
    try {
      const { data: inserted, error: insErr } = await supabase.from('order_messages').insert([{ order_id: orderId, sender_id, text }]).select().single();
      if (insErr) return res.status(500).json({ message: insErr.message });
      const { data: msg, error: selErr } = await supabase.from('order_messages').select('*, users(name)').eq('id', inserted.id).limit(1).single();
      if (selErr) return res.status(500).json({ message: selErr.message });
      const mapped = { ...msg, sender_name: msg.users ? msg.users.name : undefined };
      io.to(`order:${orderId}`).emit('order_message', mapped);
      return res.json(mapped);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const info = db.prepare('INSERT INTO order_messages (order_id, sender_id, text) VALUES (?, ?, ?)').run(orderId, sender_id, text);
  const msg = db.prepare('SELECT m.*, u.name as sender_name FROM order_messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.id = ?').get(info.lastInsertRowid);

  // emit to order room
  io.to(`order:${orderId}`).emit('order_message', msg);
  res.json(msg);
});

// ✅ LIHAT ORDER USER
app.get("/api/orders/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*, services(title), vendors(vendor_name)').eq('user_id', userId);
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const orders = db
    .prepare(`
      SELECT o.*, s.title, v.vendor_name 
      FROM orders o
      JOIN services s ON o.service_id = s.id
      JOIN vendors v ON o.vendor_id = v.id
      WHERE o.user_id = ?
    `)
    .all(userId);
  res.json(orders);
});

// GET orders for a vendor
app.get('/api/vendors/:vendorId/orders', async (req, res) => {
  const vendorId = req.params.vendorId;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*, services(title), users(name)').eq('vendor_id', vendorId);
      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const orders = db.prepare(`
    SELECT o.*, s.title, u.name as user_name
    FROM orders o
    JOIN services s ON o.service_id = s.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.vendor_id = ?
    ORDER BY o.date DESC
  `).all(vendorId);

  res.json(orders);
});

// Update an order (e.g., status changes)
app.put('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'status required' });

  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (error) return res.status(404).json({ message: error.message });

      // notify rooms
      const vendorId = data.vendor_id;
      io.to(`vendor:${vendorId}`).emit('order_updated', data);
      io.to(`order:${id}`).emit('order_updated', data);

      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || err });
    }
  }

  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  const info = stmt.run(status, id);
  if (info.changes === 0) return res.status(404).json({ message: 'Order not found' });

  const order = db.prepare('SELECT o.*, s.title, v.vendor_name FROM orders o JOIN services s ON o.service_id = s.id JOIN vendors v ON o.vendor_id = v.id WHERE o.id = ?').get(id);

  // emit updates
  io.to(`vendor:${order.vendor_id}`).emit('order_updated', order);
  io.to(`order:${id}`).emit('order_updated', order);

  res.json(order);
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("MoveandClean API aktif 🚀");
});

// Health check for uptime/monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`✅ API + Socket.IO server running at http://localhost:${PORT}`));
