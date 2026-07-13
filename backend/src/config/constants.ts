export const TRANSACTION_FEE_PERCENT = 0.01; // 1%
export const MIN_AMOUNT = 100;
export const MAX_AMOUNT = 1000000;

export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  INR: {
    AED: 0.04417,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0094,
    INR: 1,
  },
  AED: {
    INR: 22.64,
    USD: 0.2723,
    EUR: 0.2499,
    GBP: 0.2128,
    AED: 1,
  },
  USD: {
    INR: 83.12,
    AED: 3.673,
    EUR: 0.918,
    GBP: 0.782,
    USD: 1,
  }
};

export const SETTLEMENT_STEPS = [
  { id: 'kyc', name: 'KYC Verification', icon: 'user-check', delay: 1200 },
  { id: 'aml', name: 'AML Compliance Check', icon: 'shield', delay: 1500 },
  { id: 'rate_lock', name: 'Exchange Rate Lock', icon: 'lock', delay: 600 },
  { id: 'liquidity', name: 'Liquidity Pool Check', icon: 'database', delay: 900 },
  { id: 'settlement', name: 'Cross-Border Settlement', icon: 'zap', delay: 2500 },
  { id: 'notify', name: 'Recipient Notification', icon: 'bell', delay: 400 },
];

export const DEMO_SPEED_MULTIPLIERS: Record<string, number> = {
  fast: 0.2,
  normal: 1,
  slow: 2,
};

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const CURRENCIES = ['INR', 'AED', 'USD', 'EUR', 'GBP'] as const;
export type Currency = typeof CURRENCIES[number];
