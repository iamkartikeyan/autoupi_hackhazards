import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { syncUser, syncPool, syncTransaction } from '../services/neo4j.service';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const CURRENCIES = ['INR', 'AED', 'USD', 'EUR', 'GBP'];
const STATUSES = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'PROCESSING'];
const RECIPIENT_IDS = ['ahmed@uae', 'john@uk', 'sarah@us', 'fatima@uae', 'raj@dubai', 'priya@uk'];
const RECIPIENT_NAMES = ['Ahmed Al-Rashidi', 'John Smith', 'Sarah Johnson', 'Fatima Al-Zaabi', 'Raj Patel', 'Priya Sharma'];

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminId = uuidv4();
  const adminData = {
    id: adminId,
    email: 'admin@autoupi.com',
    phone: '+919999999999',
    full_name: 'AutoUPI Admin',
    role: 'ADMIN',
    kyc_status: 'VERIFIED',
    wallet_balance: 10000000,
  };
  await supabase.from('users').upsert(adminData, { onConflict: 'email' });
  await syncUser(adminData);
  console.log('✅ Admin user created: admin@autoupi.com');

  // Create demo users
  const userIds: string[] = [];
  const demoUsers = [
    { email: 'rajesh@demo.com', phone: '+919876543210', full_name: 'Rajesh Kumar', wallet_balance: 75000 },
    { email: 'priya@demo.com', phone: '+919876543211', full_name: 'Priya Sharma', wallet_balance: 120000 },
    { email: 'amit@demo.com', phone: '+919876543212', full_name: 'Amit Verma', wallet_balance: 45000 },
    { email: 'anita@demo.com', phone: '+919876543213', full_name: 'Anita Singh', wallet_balance: 200000 },
    { email: 'demo@autoupi.com', phone: '+911234567890', full_name: 'Demo User', wallet_balance: 50000 },
  ];

  for (const userData of demoUsers) {
    const userId = uuidv4();
    userIds.push(userId);
    const u = {
      id: userId,
      ...userData,
      role: 'USER',
      kyc_status: 'VERIFIED',
    };
    await supabase.from('users').upsert(u, { onConflict: 'email' });
    await syncUser(u);
  }
  console.log('✅ Demo users created');

  // Create liquidity pools
  const pools = [
    { currency: 'INR', total_capacity: 500000000, available: 435000000, locked: 15000000, threshold: 0.20 },
    { currency: 'AED', total_capacity: 2500000, available: 2200000, locked: 120000, threshold: 0.20 },
    { currency: 'USD', total_capacity: 1000000, available: 870000, locked: 50000, threshold: 0.20 },
    { currency: 'EUR', total_capacity: 900000, available: 780000, locked: 40000, threshold: 0.20 },
    { currency: 'GBP', total_capacity: 750000, available: 650000, locked: 30000, threshold: 0.20 },
  ];

  for (const pool of pools) {
    const poolId = uuidv4();
    const p = { id: poolId, ...pool };
    await supabase.from('liquidity_pools').upsert(p, { onConflict: 'currency' });
    await syncPool(p);
  }
  console.log('✅ Liquidity pools created');

  // Create historical transactions
  const transactions = [];
  for (let i = 0; i < 60; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)] || adminId;
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const recipientIdx = Math.floor(Math.random() * RECIPIENT_IDS.length);
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    transactions.push({
      id: uuidv4(),
      user_id: userId,
      amount,
      currency: 'INR',
      target_currency: 'AED',
      recipient_id: RECIPIENT_IDS[recipientIdx],
      recipient_name: RECIPIENT_NAMES[recipientIdx],
      exchange_rate: 0.04417,
      fee: Math.round(amount * 0.01 * 100) / 100,
      final_amount: Math.round(amount * 0.04417 * 100) / 100,
      status,
      blockchain_hash: status === 'COMPLETED' ? `0x${Math.random().toString(16).substr(2, 64)}` : null,
      settlement_time: status === 'COMPLETED' ? parseFloat((Math.random() * 4 + 6).toFixed(1)) : null,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  await supabase.from('transactions').insert(transactions);
  for (const t of transactions) {
    await syncTransaction(t);
  }
  console.log('✅ 60 historical transactions created');

  console.log(`
🎉 Seed complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Login:
  Phone: +919999999999
  Email: admin@autoupi.com
  
Demo User Login:
  Phone: +911234567890
  Email: demo@autoupi.com
  
Demo OTP: 123456 (when DEMO_MODE=true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

seed().catch(console.error);
