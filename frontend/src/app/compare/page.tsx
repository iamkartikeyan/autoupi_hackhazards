'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Zap, ArrowRight, Clock,
  AlertTriangle, Globe, Rocket, Turtle,
  TrendingUp, Share2, Info, ChevronDown,
  DollarSign, Landmark, CreditCard, Eye, Bell
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import toast from 'react-hot-toast';
import BrandLogo from '@/components/ui/BrandLogo';
import TimelineComparison from '@/components/features/TimelineComparison';

// ──────────────────────────────────────────────
// Constants & Data
// ──────────────────────────────────────────────
const COUNTRIES = [
  { name: 'United Arab Emirates', code: 'UAE', currency: 'AED', flag: '🇦🇪', rate: 0.044 },
  { name: 'United States', code: 'USA', currency: 'USD', flag: '🇺🇸', rate: 0.012 },
  { name: 'United Kingdom', code: 'UK', currency: 'GBP', flag: '🇬🇧', rate: 0.0095 },
  { name: 'Singapore', code: 'SGP', currency: 'SGD', flag: '🇸🇬', rate: 0.016 },
  { name: 'Europe', code: 'EU', currency: 'EUR', flag: '🇪🇺', rate: 0.011 },
];

const QUICK_AMOUNTS = [50000, 100000, 500000, 1000000, 2000000];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

const formatNum = (val: number) => 
  new Intl.NumberFormat('en-IN').format(val);

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function ComparePage() {
  const router = useRouter();

  // ── State ──
  const [amount, setAmount] = useState(100000);
  const [swiftFeePercent, setSwiftFeePercent] = useState(8);
  const [frequency, setFrequency] = useState(12);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  // ── Calculations ──
  const calcs = useMemo(() => {
    const swiftFee = (amount * swiftFeePercent) / 100;
    const swiftHidden = amount > 500000 ? 2500 : 1200;
    const swiftTotal = swiftFee + swiftHidden;

    const autoupiFee = amount * 0.02; // Fixed 2%
    const autoupiHidden = 0;
    const autoupiTotal = autoupiFee + autoupiHidden;

    const savings = swiftTotal - autoupiTotal;
    const annualSavings = savings * frequency;
    const timeRatio = 8640; // 5 days (432,000s) / 50s (avg) = 8640x

    return {
      swiftFee, swiftHidden, swiftTotal,
      autoupiFee, autoupiHidden, autoupiTotal,
      savings, annualSavings, timeRatio
    };
  }, [amount, swiftFeePercent, frequency]);

  // ── Handlers ──
  const handleCopy = () => {
    navigator.clipboard.writeText(`I'm saving ${formatCurrency(calcs.savings)} on every international transfer with AutoUPI! Check it out.`);
    toast.success('Savings details copied to clipboard! 🚀', {
      style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
    });
  };

  // ── Chart Data ──
  const barData = [
    { name: 'Traditional Bank', cost: calcs.swiftTotal, color: '#ef4444' },
    { name: 'AutoUPI', cost: calcs.autoupiTotal, color: '#10b981' },
  ];

  const pieData = [
    { name: 'AutoUPI Fee', value: calcs.autoupiFee, fill: '#6366f1' },
    { name: 'Platform Savings', value: calcs.savings, fill: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => router.push('/send')} className="flex items-center gap-3 active:scale-95 transition-transform">
            <BrandLogo size={36} />
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">AutoPay <span className="text-primary-400">2.0</span></span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-2">Dashboard</button>
            <button onClick={() => router.push('/tracking')} className="text-primary-400 hover:text-primary-300 text-sm font-bold transition-colors px-2 flex items-center gap-1.5">
              <Bell className="w-4 h-4" /> Alerts
            </button>
            <button onClick={() => router.push('/compliance')} className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-2">Compliance</button>
            <button onClick={() => router.push('/send')} className="btn-primary py-2.5 px-6 text-sm">
              Send Now
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-primary-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> RE-ENGINEERING GLOBAL PAYMENTS
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Stop Paying <span className="text-danger-500 line-through decoration-4 underline-offset-8">Hidden Fees</span> <br />
            Save Up To <span className="gradient-text">91% On Costs</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Traditional banks swallow billions in hidden spreads and SWIFT overhead. 
            AutoUPI routes your funds through GIFT City for institutional rates.
          </p>
        </motion.div>

        {/* Calculator Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 mb-12 backdrop-blur-sm relative overflow-hidden"
        >
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="grid lg:grid-cols-3 gap-10 relative z-10">
            {/* Amount Field */}
            <div className="lg:col-span-2">
              <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Transfer Amount (INR)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-500 group-focus-within:text-primary-400 transition-colors italic">₹</div>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-6 pl-14 pr-6 text-4xl font-mono font-bold text-white outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {QUICK_AMOUNTS.map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      amount === val ? 'bg-primary-500 text-white shadow-glow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {val >= 100000 ? `${val/100000} Lakh` : `${val/1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">Sending To</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-all text-white font-bold"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{selectedCountry.flag}</span>
                      {selectedCountry.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isCountryOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden"
                      >
                        {COUNTRIES.map(c => (
                          <button 
                            key={c.code}
                            onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); }}
                            className="w-full px-5 py-4 text-left hover:bg-white/5 flex items-center gap-4 transition-colors group border-b border-white/5 last:border-0"
                          >
                            <span className="text-2xl">{c.flag}</span>
                            <div className="flex-1">
                              <div className="text-white font-bold text-sm tracking-tight">{c.name}</div>
                              <div className="text-slate-500 text-xs uppercase">{c.currency} ·Institutional Node</div>
                            </div>
                            {selectedCountry.code === c.code && <CheckCircle className="w-4 h-4 text-primary-400" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-400 text-sm font-bold uppercase tracking-wider">Bank Fee Spread</label>
                  <span className="text-danger-400 font-mono font-bold text-sm">{swiftFeePercent}%</span>
                </div>
                <input 
                  type="range" min="3" max="15" step="0.5"
                  value={swiftFeePercent}
                  onChange={(e) => setSwiftFeePercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-danger-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  <span>Honest</span>
                  <span>Predatory</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SAVINGS BADGE */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={calcs.savings}
        >
          <div className="inline-block relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-success-500 text-white text-4xl lg:text-6xl font-black px-10 py-6 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] flex items-center gap-4"
            >
              <TrendingUp className="w-10 h-10" />
              <span>Save {formatCurrency(calcs.savings)}</span>
            </motion.div>
            <div className="text-slate-400 font-bold mt-4 tracking-widest uppercase text-sm">per local transaction</div>
          </div>
        </motion.div>

        {/* Side-by-Side Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Traditional Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border-2 border-white/5 rounded-3xl overflow-hidden group hover:border-danger-500/20 transition-all duration-500"
          >
            <div className="p-8 border-b border-white/5 bg-slate-800/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-danger-500/10 flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-danger-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Legacy SWIFT Banking</h3>
                  <p className="text-slate-500 text-sm">International Wire Transfer</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <ComparisonRow label="Visual Fees" value={formatCurrency(calcs.swiftFee)} icon={<CreditCard className="w-4 h-4"/>} />
              <ComparisonRow label="FX Spread (Hidden)" value={formatCurrency(calcs.swiftHidden)} icon={<Eye className="w-4 h-4"/>} sub="Correspondent overhead" />
              <ComparisonRow label="Total Wait" value="3 – 5 Business Days" icon={<Clock className="w-4 h-4"/>} color="text-danger-400" />
              <ComparisonRow label="Transparency" value="Zero (Opaque Routing)" icon={<AlertTriangle className="w-4 h-4"/>} color="text-slate-500" />
              
              <div className="pt-6 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-bold text-sm uppercase">Cost to User</span>
                  <span className="text-4xl font-black text-danger-500 num">{formatCurrency(calcs.swiftTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AutoUPI Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border-2 border-primary-500/30 rounded-3xl overflow-hidden shadow-glow relative hover:scale-[1.02] transition-all duration-500"
          >
            <div className="absolute top-6 right-6 z-20">
              <span className="bg-primary-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">91% Cheaper</span>
            </div>
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-primary-600/20 to-accent-500/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">AutoUPI Protocol</h3>
                  <p className="text-primary-400/80 text-sm font-semibold">Decentralized FX Settlement</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <ComparisonRow label="Service Fee" value={formatCurrency(calcs.autoupiFee)} icon={<Zap className="w-4 h-4"/>} />
              <ComparisonRow label="FX Hidden Costs" value="Zero (V-FX Rates)" icon={<Globe className="w-4 h-4"/>} sub="Verified best rate guarantee" />
              <ComparisonRow label="Total Wait" value="~60 Seconds" icon={<Clock className="w-4 h-4"/>} color="text-success-400" />
              <ComparisonRow label="Transparency" value="Verified On-Chain" icon={<CheckCircle className="w-4 h-4"/>} color="text-primary-300" />
              
              <div className="pt-6 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <span className="text-primary-400 font-bold text-sm uppercase">Cost to User</span>
                  <span className="text-4xl font-black text-success-500 num">{formatCurrency(calcs.autoupiTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" /> Cost Comparison Analysis
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    hide
                  />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    formatter={(val: number) => [formatCurrency(val), 'Total Cost']}
                  />
                  <Bar dataKey="cost" radius={[0, 8, 8, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-between px-2">
                {barData.map(d => (
                   <div key={d.name} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{d.name}</span>
                   </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Fee Breakdown</h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    formatter={(val: number) => [formatCurrency(val), 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pt-4 pointer-events-none">
                <span className="text-success-400 text-3xl font-black">{Math.round((calcs.savings / calcs.swiftTotal) * 100)}%</span>
                <span className="text-slate-500 text-[10px] uppercase font-black">Efficiency</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 w-full">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                    <span className="text-xs font-bold text-slate-300">{d.name}</span>
                  </div>
                  <span className="text-xs font-mono text-white">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Speed Comparison */}
        <div className="mb-20">
          <TimelineComparison />
        </div>

        {/* Annual Calculator */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900/20 border-2 border-primary-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <h2 className="text-3xl font-black text-white mb-4 relative z-10">Power User Annual Projections</h2>
          <p className="text-slate-400 mb-10 relative z-10 max-w-xl mx-auto">See how small savings on every transfer turn into a significant capital boost for your business or family over a year.</p>

          <div className="max-w-md mx-auto mb-10 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-sm font-black uppercase tracking-widest">Monthly Frequency</span>
              <span className="bg-white/10 text-white px-4 py-1 rounded-lg font-mono font-bold">{frequency} txns/mo</span>
            </div>
            <input 
              type="range" min="1" max="50"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5">
              <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Annual Capital Retained</div>
              <div className="text-5xl font-black text-success-500 num">{formatCurrency(calcs.annualSavings)}</div>
            </div>
            <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5">
              <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Effective Annual yield boost</div>
              <div className="text-5xl font-black text-primary-400 num">~{( (calcs.annualSavings / (amount * frequency)) * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button 
              onClick={handleCopy}
              className="btn-secondary py-4 px-8 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <Share2 className="w-5 h-5" /> Share My Savings
            </button>
            <button 
              onClick={() => router.push('/send')}
              className="btn-primary py-4 px-10 shadow-glow w-full sm:w-auto justify-center flex items-center gap-3"
            >
              Start Saving Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center bg-slate-950">
        <BrandLogo size={24} className="mx-auto grayscale opacity-50 mb-4" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">AutoUPI Protocol v2.4.0</p>
        <p className="text-slate-800 text-[10px] max-w-lg mx-auto leading-relaxed">
          * Calculation based on standard SWIFT correspondent banking fees (3-12%) and correspondent spread (₹500-₹4500). 
          AutoPay uses institutional L2 liquidity nodes for 2% flat pricing.
        </p>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helper Component: Comparison Row
// ──────────────────────────────────────────────
function ComparisonRow({ label, value, icon, sub, color = 'text-white' }: { label: string, value: string, icon: React.ReactNode, sub?: string, color?: string }) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-slate-500 group-hover:text-primary-400 transition-colors">{icon}</div>
        <div>
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</div>
          {sub && <div className="text-[10px] text-slate-600 font-bold">{sub}</div>}
        </div>
      </div>
      <div className={`text-sm font-bold text-right ${color}`}>{value}</div>
    </div>
  );
}
