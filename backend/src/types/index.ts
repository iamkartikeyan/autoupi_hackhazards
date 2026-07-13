export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'USER' | 'ADMIN';
  kyc_status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  wallet_balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  recipient_id: string;
  recipient_name: string;
  exchange_rate: number;
  fee: number;
  final_amount: number;
  target_currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  blockchain_hash?: string;
  settlement_time?: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionLog {
  id: string;
  transaction_id: string;
  step: string;
  status: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  created_at: string;
}

export interface LiquidityPool {
  id: string;
  currency: string;
  total_capacity: number;
  available: number;
  locked: number;
  threshold: number;
  updated_at: string;
}

export interface OtpRecord {
  id: string;
  phone: string;
  email?: string;
  otp: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
