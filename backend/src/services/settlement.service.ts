import { supabase } from '../config/supabase';
import { SETTLEMENT_STEPS, DEMO_SPEED_MULTIPLIERS, EXCHANGE_RATES, TRANSACTION_FEE_PERCENT } from '../config/constants';
import { v4 as uuidv4 } from 'uuid';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

export function setSocketServer(socketServer: SocketServer) {
  io = socketServer;
}

function sleep(ms: number): Promise<void> {
  const speed = process.env.DEMO_MODE_SPEED || 'normal';
  const multiplier = DEMO_SPEED_MULTIPLIERS[speed] || 1;
  return new Promise(resolve => setTimeout(resolve, ms * multiplier));
}

function generateBlockchainHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

async function emitLog(transactionId: string, step: string, status: string, message: string) {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
  
  const log = { step, status, message, timestamp, transactionId };
  
  // Emit via WebSocket
  if (io) {
    io.to(`txn_${transactionId}`).emit('txn_log', log);
    io.to('admin').emit('admin_log', log);
  }

  // Save to DB
  await supabase.from('transaction_logs').insert({
    id: uuidv4(),
    transaction_id: transactionId,
    step,
    status,
    message,
  });
}

export async function initiateTransaction(
  userId: string,
  amount: number,
  currency: string,
  targetCurrency: string,
  recipientId: string,
  recipientName: string
) {
  // Get exchange rate
  const rates = EXCHANGE_RATES[currency];
  if (!rates) throw new Error(`Unsupported currency: ${currency}`);
  const exchangeRate = rates[targetCurrency] || 0;
  if (!exchangeRate) throw new Error(`Unsupported target currency: ${targetCurrency}`);

  const fee = Math.round(amount * TRANSACTION_FEE_PERCENT * 100) / 100;
  const finalAmount = Math.round(amount * exchangeRate * 100) / 100;

  // Check user balance
  const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', userId).single();
  if (!user || user.wallet_balance < amount + fee) {
    throw new Error('Insufficient balance');
  }

  // Create transaction
  const transactionId = uuidv4();
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      id: transactionId,
      user_id: userId,
      amount,
      currency,
      target_currency: targetCurrency,
      recipient_id: recipientId,
      recipient_name: recipientName,
      exchange_rate: exchangeRate,
      fee,
      final_amount: finalAmount,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) throw error;

  // Start processing async (don't await)
  processTransaction(transactionId, userId, amount, fee).catch(console.error);

  return {
    transactionId,
    status: 'PENDING',
    estimatedTime: '8 seconds',
    transaction,
  };
}

async function processTransaction(transactionId: string, userId: string, amount: number, fee: number) {
  const startTime = Date.now();

  try {
    // Update status to processing
    await supabase.from('transactions').update({ status: 'PROCESSING' }).eq('id', transactionId);
    if (io) io.to(`txn_${transactionId}`).emit('txn_status', { status: 'PROCESSING' });

    // Process each step
    for (const step of SETTLEMENT_STEPS) {
      await emitLog(transactionId, step.id, 'INFO', `${step.name} initiated...`);
      await sleep(step.delay);

      // Step-specific messages
      let successMessage = '';
      switch (step.id) {
        case 'kyc': successMessage = 'Identity verified. KYC status: VERIFIED ✓'; break;
        case 'aml': successMessage = 'AML scan complete. No suspicious patterns detected ✓'; break;
        case 'rate_lock': successMessage = 'Exchange rate locked for 60 seconds ✓'; break;
        case 'liquidity': successMessage = 'Sufficient liquidity confirmed in AED pool ✓'; break;
        case 'settlement': successMessage = `Blockchain settlement confirmed. Block #${Math.floor(Math.random() * 9000000 + 10000000)} ✓`; break;
        case 'notify': successMessage = 'Recipient notified via SMS and email ✓'; break;
      }

      await emitLog(transactionId, step.id, 'SUCCESS', successMessage);
    }

    const settlementTime = Math.round((Date.now() - startTime) / 100) / 10;
    const hash = generateBlockchainHash();

    // Deduct from user balance
    await supabase.rpc('deduct_balance', { user_id: userId, amount: amount + fee });

    // Complete transaction
    await supabase.from('transactions').update({
      status: 'COMPLETED',
      blockchain_hash: hash,
      settlement_time: settlementTime,
    }).eq('id', transactionId);

    // Emit completion
    if (io) {
      io.to(`txn_${transactionId}`).emit('txn_complete', {
        hash,
        timeTaken: `${settlementTime}s`,
        status: 'COMPLETED',
      });
      io.to('admin').emit('admin_update', { type: 'transaction_complete', transactionId });
    }

    console.log(`✅ Transaction ${transactionId} completed in ${settlementTime}s`);
  } catch (err) {
    console.error(`❌ Transaction ${transactionId} failed:`, err);
    await supabase.from('transactions').update({ status: 'FAILED' }).eq('id', transactionId);
    if (io) {
      io.to(`txn_${transactionId}`).emit('txn_failed', { error: 'Settlement failed' });
    }
  }
}

export async function getTransaction(transactionId: string, userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_logs(*)')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId: string, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { transactions: data, total: count, page, limit };
}
