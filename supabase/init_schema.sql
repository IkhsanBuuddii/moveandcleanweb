-- Postgres schema for MoveAndClean derived from local sqlite schema
-- Run this in Supabase SQL editor or copy into a supabase migration file

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS vendors (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  vendor_name TEXT,
  description TEXT,
  location TEXT,
  rating DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  title TEXT,
  price DOUBLE PRECISION,
  duration TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE SET NULL,
  service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
  date TIMESTAMP WITHOUT TIME ZONE,
  scheduled_at TIMESTAMP WITHOUT TIME ZONE,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  total DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS order_messages (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
