'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Zap, Users, TrendingUp, CheckCircle, Clock, Database,
  ArrowUpRight, ArrowDownRight, RefreshCw, LogOut,
  Activity, DollarSign, BarChart2, Settings, Bell
} from 'lucide-react';
import { adminApi, getStoredUser, clearAuth, isAuthenticated } from '@/lib/api';
import toast from 'react-hot-toast';
import BrandLogo from '@/components/ui/BrandLogo';

const CHART_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  volume: Math.floor(Math.random() * 5000000) + 1000000,
  txns: Math.floor(Math.random() * 500) + 100,
}));

interface Pool { currency: string; available: number; total_capacity: number; locked: number; }
interface Stats { todayTransactions: number; totalTransactions: number; totalVolume: number; avgSettlementTime: number; successRate: number; }
interface Txn { id: string; amount: number; currency: string; target_currency: string; recipient_name: string; status: string; created_at: string; settlement_time: number | null; users?: { full_name: string } | null; }

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'liquidity', label: 'Liquidity', icon: Database },
  { id: 'users', label: 'Users', icon: Users },
];

const POOL_COLORS: Record<string, string> = { INR: 'from-primary-500 to-primary-600', AED: 'from-green-500 to-green-600', USD: 'from-yellow-500 to-yellow-600', EUR: 'from-purple-500 to-purple-600', GBP: 'from-red-500 to-red-600' };
const POOL_FLAGS: Record<string, string> = { INR: '🇮🇳', AED: '🇦🇪', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧' };

export default function AdminPage() {
  const router = useRouter();
  const user = getStoredUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN') { router.push('/send'); return; }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, poolsRes, txnsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPools(),
        adminApi.getTransactions(),
        adminApi.getUsers(),
      ]);
      setStats(statsRes.data.data);
      setPools(poolsRes.data.data || []);
      setTransactions(txnsRes.data.data?.transactions || []);
      setUsers(usersRes.data.data?.users || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleRebalance(currency: string) {
    setRebalancing(currency);
    try {
      await adminApi.rebalancePool(currency, 1000000);
      toast.success(`${currency} pool rebalanced!`);
      loadData();
    } catch { toast.error('Failed to rebalance'); }
    finally { setRebalancing(''); }
  }

  const STATUS_COLORS: Record<string, string> = {
    COMPLETED: 'badge-success', PROCESSING: 'badge-info', PENDING: 'badge-warning', FAILED: 'badge-danger'
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-slate-400 text-sm">Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-5 border-b border-white/5">
          <div className="space-y-1">
            <BrandLogo size={36} textClassName="font-bold text-white text-sm" />
            <div className="text-xs text-slate-500 pl-[46px]">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-glow'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div>
              <div className="text-xs font-medium text-white">{user?.full_name}</div>
              <div className="text-xs text-slate-500">Administrator</div>
            </div>
          </div>
          <button onClick={() => { router.push('/send'); }} className="w-full text-xs text-slate-400 hover:text-white flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors mb-1">
            <Zap className="w-3 h-3" /> User Portal
          </button>
          <button onClick={() => { clearAuth(); router.push('/login'); }} className="w-full text-xs text-slate-400 hover:text-red-400 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-slate-900/50 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h1 className="text-white font-bold capitalize">{activeTab}</h1>
            <p className="text-slate-500 text-xs">AutoUPI Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-success-500/10 border border-success-500/30 rounded-full px-3 py-1">
              <div className="live-dot" />
              <span className="text-xs text-success-400 font-medium">LIVE</span>
            </div>
            <button onClick={loadData} className="btn-ghost !text-slate-400 p-2">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="btn-ghost !text-slate-400 p-2">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Today's Transactions", value: stats?.todayTransactions || 0, icon: Activity, change: '+12.5%', up: true, color: 'text-primary-400' },
                  { label: 'Total Volume', value: `₹${((stats?.totalVolume || 0) / 100000).toFixed(1)}L`, icon: DollarSign, change: '+₹4.5L', up: true, color: 'text-green-400' },
                  { label: 'Avg Settlement', value: `${stats?.avgSettlementTime || '8.2'}s`, icon: Clock, change: '-0.3s', up: true, color: 'text-yellow-400' },
                  { label: 'Success Rate', value: `${stats?.successRate || 99.7}%`, icon: CheckCircle, change: '+0.2%', up: true, color: 'text-success-400' },
                ].map((s, i) => (
                  <motion.div key={s.label} className="bg-slate-900 border border-white/5 rounded-2xl p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center`}>
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? 'text-success-400' : 'text-danger-400'}`}>
                        {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {s.change}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold num ${s.color} mb-1`}>{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white">Transaction Volume (2024)</h3>
                  <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">Monthly</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Volume']} />
                    <Area type="monotone" dataKey="volume" stroke="#2563EB" strokeWidth={2} fill="url(#volumeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent activity */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs text-primary-400 hover:text-primary-300">View all</button>
                </div>
                <div className="divide-y divide-white/5">
                  {transactions.slice(0, 6).map(txn => (
                    <div key={txn.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                          {txn.users?.full_name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{txn.users?.full_name || 'User'}</div>
                          <div className="text-xs text-slate-500">→ {txn.recipient_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white num">₹{txn.amount.toLocaleString()}</div>
                        <span className={STATUS_COLORS[txn.status] || 'badge-info'}>{txn.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-bold text-white">All Transactions ({transactions.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Sender</th>
                      <th className="px-6 py-3 text-left">Recipient</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3.5 text-xs font-mono text-slate-500">{txn.id.slice(0, 8)}...</td>
                        <td className="px-6 py-3.5 text-sm text-slate-300">{txn.users?.full_name || '—'}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-300">{txn.recipient_name}</td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-white num text-right">
                          ₹{txn.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={STATUS_COLORS[txn.status] || 'badge-info'}>{txn.status}</span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-400 num text-right">
                          {txn.settlement_time ? `${txn.settlement_time}s` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LIQUIDITY */}
          {activeTab === 'liquidity' && (
            <>
              <div className="grid lg:grid-cols-2 gap-6">
                {pools.map(pool => {
                  const pct = Math.round((pool.available / pool.total_capacity) * 100);
                  const health = pct > 50 ? 'success' : pct > 25 ? 'warning' : 'danger';
                  const healthColor = { success: 'text-success-400', warning: 'text-yellow-400', danger: 'text-red-400' }[health];
                  return (
                    <div key={pool.currency} className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{POOL_FLAGS[pool.currency]}</div>
                          <div>
                            <div className="font-bold text-white">{pool.currency} Pool</div>
                            <div className={`text-xs ${healthColor} font-medium`}>
                              {pct > 50 ? '● Healthy' : pct > 25 ? '● Moderate' : '⚠ Low'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRebalance(pool.currency)}
                          disabled={!!rebalancing}
                          className="flex items-center gap-1.5 text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-lg hover:bg-primary-500/20 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${rebalancing === pool.currency ? 'animate-spin' : ''}`} />
                          Rebalance
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                          <span>Available</span>
                          <span className="num">{pct}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${POOL_COLORS[pool.currency]}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Total', value: pool.total_capacity },
                          { label: 'Available', value: pool.available },
                          { label: 'Locked', value: pool.locked },
                        ].map(m => (
                          <div key={m.label} className="bg-white/5 rounded-xl p-3">
                            <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                            <div className="text-sm font-bold text-white num">
                              {m.value >= 1000000 ? `${(m.value/1000000).toFixed(1)}M` :
                               m.value >= 100000 ? `${(m.value/100000).toFixed(1)}L` :
                               m.value.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-bold text-white">All Users ({users.length})</h3>
              </div>
              <div className="divide-y divide-white/5">
                {users.map((u: Record<string, unknown>) => (
                  <div key={u.id as string} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                        {(u.full_name as string)?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{u.full_name as string}</div>
                        <div className="text-xs text-slate-500">{u.email as string || u.phone as string}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-white num">₹{((u.wallet_balance as number) || 0).toLocaleString('en-IN')}</div>
                        <div className="text-xs text-slate-500">Balance</div>
                      </div>
                      <span className={(u.role as string) === 'ADMIN' ? 'badge-info' : 'badge-success'}>
                        {u.role as string}
                      </span>
                      <span className="badge-success">{u.kyc_status as string}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
