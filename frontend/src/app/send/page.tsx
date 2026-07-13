'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, ArrowLeftRight, Shield, Globe, CheckCircle, TrendingUp, Clock, Star, LogOut, Zap, Bell } from 'lucide-react';
import { transactionApi, getStoredUser, clearAuth, isAuthenticated } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'Pound Sterling' },
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];
const QUICK_RECIPIENTS = [
  { id: 'ahmed@uae', name: 'Ahmed Al-Rashidi', flag: '🇦🇪' },
  { id: 'john@uk', name: 'John Smith', flag: '🇬🇧' },
  { id: 'sarah@us', name: 'Sarah Johnson', flag: '🇺🇸' },
];

const FEE_PERCENT = 0.02;

const RATES: Record<string, Record<string, number>> = {
  INR: { AED: 0.04417, USD: 0.012, EUR: 0.011, GBP: 0.0094, INR: 1 },
  AED: { INR: 22.64, USD: 0.2723, EUR: 0.2499, GBP: 0.2128, AED: 1 },
  USD: { INR: 83.12, AED: 3.673, EUR: 0.918, GBP: 0.782, USD: 1 },
};

function formatAmount(val: string) {
  const num = val.replace(/,/g, '');
  if (isNaN(Number(num))) return val;
  return Number(num).toLocaleString('en-IN');
}

export default function SendPage() {
  const router = useRouter();
  const user = getStoredUser();
  const [amount, setAmount] = useState('10,000');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('AED');
  const [recipientId, setRecipientId] = useState('ahmed@uae');
  const [recipientName, setRecipientName] = useState('Ahmed Al-Rashidi');
  const [loading, setLoading] = useState(false);
  const [rateTimer, setRateTimer] = useState(60);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      setRateTimer(t => t <= 1 ? 60 : t - 1);
      setTicker(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const rawAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const from = CURRENCIES.find(c => c.code === fromCurrency)!;
  const to = CURRENCIES.find(c => c.code === toCurrency)!;
  const rate = RATES[fromCurrency]?.[toCurrency] || 0.04417;
  const fee = Math.round(rawAmount * FEE_PERCENT * 100) / 100;
  const converted = Math.round(rawAmount * rate * 100) / 100;
  const totalDebit = rawAmount + fee;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (rawAmount < 100) return toast.error('Minimum amount is ₹100');
    if (!recipientId) return toast.error('Enter recipient ID');
    if (!recipientName) return toast.error('Enter recipient name');

    setLoading(true);
    try {
      const res = await transactionApi.initiate({
        amount: rawAmount,
        currency: fromCurrency,
        targetCurrency: toCurrency,
        recipientId,
        recipientName,
      });
      const { transactionId } = res.data.data;
      toast.success('Transaction initiated!');
      router.push(`/process?id=${transactionId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate transaction');
      setLoading(false);
    }
  }

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-surface-2">
      {/* Live ticker */}
      <div className="bg-gradient-to-r from-primary-900 to-accent-600 overflow-hidden py-2.5">
        <div className="flex animate-ticker whitespace-nowrap gap-12 text-xs text-white/80 font-mono">
          {[...Array(3)].flatMap(() => [
            `🔴 LIVE  INR/AED ${(0.04417 + Math.sin(ticker * 0.1) * 0.0001).toFixed(5)}`,
            `INR/USD ${(0.012 + Math.sin(ticker * 0.12) * 0.0001).toFixed(5)}`,
            `INR/EUR ${(0.011 + Math.sin(ticker * 0.08) * 0.0001).toFixed(5)}`,
            `INR/GBP ${(0.0094 + Math.sin(ticker * 0.09) * 0.0001).toFixed(5)}`,
            `Updated ${ticker}s ago`,
          ]).map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-surface-4/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo size={32} textClassName="font-bold text-slate-800 text-lg" />

          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/dashboard')} className="btn-ghost text-xs">History</button>
            <button onClick={() => router.push('/tracking')} className="btn-ghost text-xs flex items-center gap-1.5 text-primary-600 font-bold">
              <Bell className="w-3 h-3" /> Alerts
            </button>
            <button onClick={() => router.push('/track')} className="btn-ghost text-xs">🗺️ Track</button>
            <button onClick={() => router.push('/compliance')} className="btn-ghost text-xs">🛡️ Compliance</button>
            {user?.role === 'ADMIN' && (
              <button onClick={() => router.push('/admin')} className="btn-ghost text-xs">Admin</button>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-surface-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.full_name}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost p-2">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Hero */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                Send Money{' '}
                <span className="gradient-text">Globally</span>
                <br />in 8 Seconds
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                Traditional banks take 3-5 days and charge 3-5%. We do it in 8 seconds for just 1%.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {[
                { icon: Clock, label: 'Avg Settlement', value: '8.2s', color: 'text-primary-600' },
                { icon: TrendingUp, label: 'Success Rate', value: '99.7%', color: 'text-success-600' },
                { icon: Shield, label: 'Transactions', value: '50K+', color: 'text-accent-500' },
                { icon: Star, label: 'User Rating', value: '4.9★', color: 'text-warning-500' },
              ].map(s => (
                <div key={s.label} className="card py-4 px-4">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <div className={`text-xl font-bold num ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Trust */}
            <div className="flex flex-wrap gap-2">
              {['KYC Verified ✓', 'RBI Compliant ✓', '256-bit SSL ✓'].map(b => (
                <span key={b} className="text-xs font-medium text-slate-500 bg-white border border-surface-4 px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Balance */}
            <div className="mb-4 flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-surface-4 shadow-soft">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="live-dot" />
                <span>Available Balance</span>
              </div>
              <span className="font-bold text-slate-800 num">₹{(user?.wallet_balance || 32492).toLocaleString('en-IN')}</span>
            </div>

            <form onSubmit={handleSend} className="card !p-0 overflow-hidden">
              <div className="p-6 border-b border-surface-4/60">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Send International Payment</h2>
                <p className="text-xs text-slate-400">Powered by UPI + Blockchain Technology</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount to Send</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold num">{from.symbol}</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={e => setAmount(formatAmount(e.target.value.replace(/[^0-9,]/g, '')))}
                      className="input-field pl-10 text-2xl font-bold num h-14"
                      placeholder="0"
                    />
                    <select
                      value={fromCurrency}
                      onChange={e => setFromCurrency(e.target.value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-3 border border-surface-4 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {QUICK_AMOUNTS.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(a.toLocaleString('en-IN'))}
                        className="text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors num"
                      >
                        {from.symbol}{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency swap */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-surface-4" />
                  <button
                    type="button"
                    onClick={swapCurrencies}
                    className="w-9 h-9 rounded-xl border-2 border-surface-4 bg-white flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-colors shadow-soft"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                  <div className="flex-1 h-px bg-surface-4" />
                </div>

                {/* Recipient */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient UPI ID</label>
                    <input
                      type="text"
                      value={recipientId}
                      onChange={e => setRecipientId(e.target.value)}
                      placeholder="name@uae"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Full name"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {/* Quick recipients */}
                <div className="flex gap-2 flex-wrap">
                  {QUICK_RECIPIENTS.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setRecipientId(r.id); setRecipientName(r.name); }}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${recipientId === r.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-4 bg-white text-slate-600 hover:border-primary-300'}`}
                    >
                      {r.flag} {r.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* To currency */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Receive In</label>
                  <select
                    value={toCurrency}
                    onChange={e => setToCurrency(e.target.value)}
                    className="input-field"
                  >
                    {CURRENCIES.filter(c => c.code !== fromCurrency).map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                {/* Rate box */}
                <div className="bg-slate-900 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="live-dot" />
                      <span className="text-xs text-slate-400 font-medium">LIVE RATE</span>
                    </div>
                    <span className="text-xs font-mono text-yellow-400">🔒 Locked {rateTimer}s</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-slate-400 mb-0.5">Recipient Gets</div>
                      <div className="text-3xl font-bold num text-white">
                        {to.symbol}{converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Exchange Rate</div>
                      <div className="text-sm font-mono text-green-400">1 {fromCurrency} = {rate} {toCurrency}</div>
                    </div>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="bg-surface-2 rounded-xl p-4 space-y-2.5 text-sm">
                  {[
                    { label: 'Transfer Amount', value: `${from.symbol}${rawAmount.toLocaleString('en-IN')}` },
                    { label: `Fee (${(FEE_PERCENT * 100).toFixed(1)}%)`, value: `${from.symbol}${fee.toLocaleString('en-IN')}`, sub: true },
                  ].map(row => (
                    <div key={row.label} className={`flex justify-between ${row.sub ? 'text-slate-500' : 'text-slate-600'}`}>
                      <span>{row.label}</span>
                      <span className="num font-medium">{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-surface-4 flex justify-between font-bold text-slate-800">
                    <span>Total Debit</span>
                    <span className="num">{from.symbol}{totalDebit.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading || rawAmount < 100}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-lg flex items-center justify-center gap-3 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none shadow-inner-light"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Send {from.symbol}{rawAmount.toLocaleString('en-IN')} Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                  {['256-bit encrypted', 'Instant settlement', 'RBI compliant'].map(t => (
                    <div key={t} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-success-500" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Compare */}
            <button
              onClick={() => router.push('/compare')}
              className="w-full mt-3 py-3 text-sm text-slate-500 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Compare with traditional banks
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
