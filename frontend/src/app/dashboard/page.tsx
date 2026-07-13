'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, CheckCircle, XCircle, Loader2, LogOut, TrendingUp, Send, Bell, Smartphone } from 'lucide-react';
import { transactionApi, getStoredUser, clearAuth, isAuthenticated } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

interface Transaction {
  id: string; amount: number; currency: string; target_currency: string;
  recipient_name: string; recipient_id: string; final_amount: number;
  status: string; settlement_time: number | null; created_at: string; fee: number;
}

const STATUS_CONFIG = {
  COMPLETED: { color: 'badge-success', icon: CheckCircle, label: 'Completed' },
  PROCESSING: { color: 'badge-info', icon: Loader2, label: 'Processing' },
  PENDING: { color: 'badge-warning', icon: Clock, label: 'Pending' },
  FAILED: { color: 'badge-danger', icon: XCircle, label: 'Failed' },
};

export default function DashboardPage() {
  const router = useRouter();
  const user = getStoredUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [router]);

  useEffect(() => {
    setLoading(true);
    transactionApi.getHistory(page, 10)
      .then(res => {
        const data = res.data.data;
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const completed = transactions.filter(t => t.status === 'COMPLETED');
  const totalVolume = completed.reduce((sum, t) => sum + t.amount, 0);
  const totalSaved = Math.round(totalVolume * 0.035);
  const avgTime = completed.length > 0
    ? (completed.reduce((s, t) => s + (t.settlement_time || 8), 0) / completed.length).toFixed(1)
    : '8.2';

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-surface-4/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/send')} className="flex items-center gap-2">
            <BrandLogo size={32} textClassName="font-bold text-slate-800" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/tracking')} className="btn-ghost text-xs flex items-center gap-1.5 text-primary-600 font-bold">
              <Bell className="w-3 h-3" /> Alerts
            </button>
            <button onClick={() => router.push('/compliance')} className="btn-ghost text-xs">🛡️ Compliance</button>
            <button onClick={() => router.push('/send')} className="btn-primary text-xs py-2 px-4">
              <Send className="w-3 h-3" /> Send Money
            </button>
            <button onClick={() => { clearAuth(); router.push('/login'); }} className="btn-ghost p-2">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500">Your transaction history and account overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Wallet Balance', value: `₹${(user?.wallet_balance || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'text-primary-600' },
            { label: 'Total Sent', value: `₹${totalVolume.toLocaleString('en-IN')}`, icon: '📤', color: 'text-slate-700' },
            { label: 'Total Saved', value: `₹${totalSaved.toLocaleString('en-IN')}`, icon: '🎯', color: 'text-success-600' },
            { label: 'Avg Speed', value: `${avgTime}s`, icon: '⚡', color: 'text-accent-500' },
            { label: 'Live Alerts', value: 'Active', icon: '📱', color: 'text-primary-600', link: '/tracking' },
          ].map(s => (
            <motion.div 
              key={s.label} 
              className={`card cursor-pointer group hover:border-primary-500/50 transition-all ${s.link ? 'bg-primary-50' : 'bg-white'}`} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              onClick={() => s.link && router.push(s.link)}
            >
              <div className="text-2xl mb-2 flex justify-between items-start">
                <span>{s.icon}</span>
                {s.link && <ArrowRight className="w-3 h-3 text-primary-400 group-hover:translate-x-1 transition-transform" />}
              </div>
              <div className={`text-xl font-bold num ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Transactions */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-4/60 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Transaction History</h2>
            <span className="text-sm text-slate-400">{total} total</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-bold text-slate-700 mb-2">No transactions yet</h3>
              <p className="text-slate-400 text-sm mb-6">Start by sending your first international payment</p>
              <button onClick={() => router.push('/send')} className="btn-primary">
                Send Money Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {/* Table header - desktop */}
              <div className="hidden lg:grid grid-cols-6 px-6 py-3 bg-surface-2 border-b border-surface-4/60 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="col-span-2">Recipient</span>
                <span>Amount</span>
                <span>Received</span>
                <span>Status</span>
                <span>Time</span>
              </div>

              {transactions.map((txn, i) => {
                const sc = STATUS_CONFIG[txn.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                const Icon = sc.icon;
                return (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-6 py-4 border-b border-surface-4/40 last:border-0 hover:bg-surface-2 transition-colors cursor-pointer"
                    onClick={() => router.push(`/process?id=${txn.id}`)}
                  >
                    {/* Mobile */}
                    <div className="lg:hidden flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-700 text-sm">{txn.recipient_name}</div>
                        <div className="text-xs text-slate-400">{txn.recipient_id}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(txn.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800 num">₹{txn.amount.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-primary-600 num">{txn.target_currency} {txn.final_amount}</div>
                        <div className={`mt-1 ${sc.color}`}><Icon className="w-3 h-3 inline mr-1" />{sc.label}</div>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden lg:grid grid-cols-6 items-center">
                      <div className="col-span-2">
                        <div className="font-semibold text-slate-700 text-sm">{txn.recipient_name}</div>
                        <div className="text-xs text-slate-400">{txn.recipient_id}</div>
                      </div>
                      <div className="font-semibold text-slate-700 num text-sm">₹{txn.amount.toLocaleString('en-IN')}</div>
                      <div className="text-primary-600 num text-sm font-medium">{txn.target_currency} {txn.final_amount}</div>
                      <div>
                        <span className={sc.color}>
                          <Icon className="w-3 h-3" />{sc.label}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs num">
                        {txn.settlement_time ? `${txn.settlement_time}s` : '—'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {total > 10 && (
                <div className="px-6 py-4 flex items-center justify-between text-sm text-slate-500">
                  <span>Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</span>
                  <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 disabled:opacity-40">Prev</button>
                    <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={() => router.push('/compare')} className="btn-ghost text-sm">Compare with banks</button>
          {user?.role === 'ADMIN' && (
            <button onClick={() => router.push('/admin')} className="btn-ghost text-sm">
              <TrendingUp className="w-4 h-4" /> Admin Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
