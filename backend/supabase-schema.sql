-- ============================================
-- AutoUPI - Complete Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'AutoUPI User',
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  kyc_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (kyc_status IN ('VERIFIED', 'PENDING', 'REJECTED')),
  wallet_balance NUMERIC(15, 2) NOT NULL DEFAULT 50000.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- OTP RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS otp_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  email TEXT,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_records(phone);

-- Auto cleanup old OTPs (optional, run as cron)
-- DELETE FROM otp_records WHERE expires_at < NOW() - INTERVAL '1 hour';

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  target_currency TEXT NOT NULL DEFAULT 'AED',
  recipient_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  exchange_rate NUMERIC(10, 6) NOT NULL,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_amount NUMERIC(15, 4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  blockchain_hash TEXT,
  settlement_time NUMERIC(5, 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- TRANSACTION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('INFO', 'SUCCESS', 'WARN', 'ERROR')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_transaction_id ON transaction_logs(transaction_id);

-- ============================================
-- LIQUIDITY POOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS liquidity_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency TEXT UNIQUE NOT NULL,
  total_capacity NUMERIC(20, 2) NOT NULL,
  available NUMERIC(20, 2) NOT NULL,
  locked NUMERIC(20, 2) NOT NULL DEFAULT 0,
  threshold NUMERIC(4, 2) NOT NULL DEFAULT 0.20,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to deduct balance from user wallet
CREATE OR REPLACE FUNCTION deduct_balance(user_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET wallet_balance = wallet_balance - amount,
      updated_at = NOW()
  WHERE id = user_id AND wallet_balance >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or user not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_pools ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (backend uses service key)
-- These policies are for anon/authenticated Supabase clients only

-- Users can read their own data
CREATE POLICY "Users read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Transactions: users see only theirs
CREATE POLICY "Users see own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Liquidity pools: public read
CREATE POLICY "Public read pools" ON liquidity_pools
  FOR SELECT USING (true);

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Insert initial liquidity pools
INSERT INTO liquidity_pools (id, currency, total_capacity, available, locked, threshold) VALUES
  (uuid_generate_v4(), 'INR', 500000000, 435000000, 15000000, 0.20),
  (uuid_generate_v4(), 'AED', 2500000, 2200000, 120000, 0.20),
  (uuid_generate_v4(), 'USD', 1000000, 870000, 50000, 0.20),
  (uuid_generate_v4(), 'EUR', 900000, 780000, 40000, 0.20),
  (uuid_generate_v4(), 'GBP', 750000, 650000, 30000, 0.20)
ON CONFLICT (currency) DO NOTHING;

-- ============================================
-- DONE! Now run: npm run seed
-- to populate with demo users and transactions
-- ============================================
