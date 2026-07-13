'use client';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  CheckCircle, Circle, Loader2, ArrowLeft, Clock,
  Shield, Lock, Database, Rocket, Bell, Globe,
  Zap, TrendingUp,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface MilestoneStatus { step: string; status: 'pending' | 'active' | 'completed'; timestamp?: string; }
interface TxnDetails { amount: number; currency: string; targetCurrency: string; rate: number; fee: number; recipientName: string; }
interface StepLog { step: string; status: string; message: string; timestamp: string; }

// ──────────────────────────────────────────────
// Milestone Definitions
// ──────────────────────────────────────────────
const MILESTONES = [
  {
    id: 'sender',
    label: '🇮🇳 Sender',
    country: 'Mumbai, India',
    description: 'Transaction initiated from India',
    lat: 19.076,
    lng: 72.877,
    icon: '🇮🇳',
    wsStep: 'kyc',
  },
  {
    id: 'bank_lock',
    label: '🏦 Bank Reserve Lock',
    country: 'RBI Clearing',
    description: 'Funds locked at Indian Reserve Bank',
    lat: 28.6139,
    lng: 77.209,
    icon: '🏦',
    wsStep: 'aml',
  },
  {
    id: 'token_mint',
    label: '🪙 TBD Token Mint',
    country: 'Blockchain Layer',
    description: 'Digital tokens minted on settlement chain',
    lat: 21.1458,
    lng: 79.0882,
    icon: '🪙',
    wsStep: 'rate_lock',
  },
  {
    id: 'gift_city',
    label: '🌐 GIFT City FX',
    country: 'GIFT City, Gujarat',
    description: 'Foreign exchange conversion at GIFT City IFSC',
    lat: 23.1685,
    lng: 72.6498,
    icon: '🌐',
    wsStep: 'liquidity',
  },
  {
    id: 'recipient',
    label: '🇦🇪 Recipient',
    country: 'Dubai, UAE',
    description: 'Funds credited to recipient wallet',
    lat: 25.2048,
    lng: 55.2708,
    icon: '🇦🇪',
    wsStep: 'settlement',
  },
];

const STATUS_COLORS = {
  pending: '#6B7280',
  active: '#2563EB',
  completed: '#10B981',
};

// ──────────────────────────────────────────────
// Dynamically import LeafletMap (no SSR)
// ──────────────────────────────────────────────
interface LeafletMapProps {
  milestones: typeof MILESTONES;
  milestoneStates: MilestoneStatus[];
  onHover: (id: string | null) => void;
}

const LeafletMap = dynamic<LeafletMapProps>(() => import('@/components/track/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-slate-400 text-sm">Loading map…</div>
      </div>
    </div>
  ),
});

// ──────────────────────────────────────────────
// Main Inner Component
// ──────────────────────────────────────────────
function TrackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txnId = searchParams.get('id');

  // WebSocket & state
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [overallStatus, setOverallStatus] = useState<'processing' | 'complete' | 'failed'>('processing');
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);

  // Milestone states
  const [milestones, setMilestones] = useState<MilestoneStatus[]>(
    MILESTONES.map(m => ({ step: m.id, status: 'pending' }))
  );

  // Animated progress
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progress = Math.round((completedCount / MILESTONES.length) * 100);

  // Demo transaction details (would come from API in production)
  const [txnDetails] = useState<TxnDetails>({
    amount: 10000,
    currency: 'INR',
    targetCurrency: 'AED',
    rate: 0.04417,
    fee: 200,
    recipientName: 'Ahmed Al-Rashidi',
  });

  const addLog = useCallback((step: string, status: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { step, status, message, timestamp }]);
  }, []);

  const markStep = useCallback((wsStep: string, newStatus: 'active' | 'completed') => {
    const milestone = MILESTONES.find(m => m.wsStep === wsStep);
    if (!milestone) return;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    setMilestones(prev => prev.map(m =>
      m.step === milestone.id ? { ...m, status: newStatus, timestamp: newStatus === 'completed' ? now : undefined } : m
    ));
  }, []);

  // Demo auto-play if no txnId (for standalone demo)
  useEffect(() => {
    if (txnId) return; // real WS will handle it
    const steps: ('active' | 'completed')[] = ['active', 'completed'];
    let mi = 0;
    let si = 0;
    const interval = setInterval(() => {
      if (mi >= MILESTONES.length) { clearInterval(interval); setOverallStatus('complete'); return; }
      const m = MILESTONES[mi];
      const s = steps[si];
      markStep(m.wsStep, s);
      if (s === 'active') addLog(m.wsStep, 'INFO', `Processing: ${m.label}`);
      else addLog(m.wsStep, 'SUCCESS', `✓ ${m.label} complete`);
      si++;
      if (si >= steps.length) { si = 0; mi++; }
    }, 1200);
    timerRef.current = setInterval(() => setElapsed(e => e + 100), 100);
    return () => { clearInterval(interval); if (timerRef.current) clearInterval(timerRef.current); };
  }, [txnId, markStep, addLog]);

  // Real WebSocket if txnId provided
  useEffect(() => {
    if (!txnId) return;
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_transaction', txnId);
      addLog('system', 'INFO', `Connected — tracking ${txnId.slice(0, 8)}…`);
    });

    socket.on('txn_status', ({ status: s }: { status: string }) => {
      if (s === 'PROCESSING') {
        timerRef.current = setInterval(() => setElapsed(e => e + 100), 100);
      }
    });

    socket.on('txn_log', (data: StepLog) => {
      addLog(data.step, data.status, data.message);
      if (data.status === 'INFO') markStep(data.step, 'active');
      else if (data.status === 'SUCCESS') markStep(data.step, 'completed');
    });

    socket.on('txn_complete', () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setOverallStatus('complete');
    });

    socket.on('txn_failed', () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setOverallStatus('failed');
    });

    return () => { if (timerRef.current) clearInterval(timerRef.current); socket.disconnect(); };
  }, [txnId, addLog, markStep]);

  const elapsedSec = (elapsed / 1000).toFixed(1);
  const activeStep = MILESTONES.find(m => milestones.find(ms => ms.step === m.id)?.status === 'active');
  const hoveredMeta = hoveredMilestone ? MILESTONES.find(m => m.id === hoveredMilestone) : null;
  const hoveredState = hoveredMilestone ? milestones.find(m => m.step === hoveredMilestone) : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Top Bar ─────────────────────────────── */}
      <div className="bg-slate-900/70 border-b border-white/5 px-4 py-3 flex items-center justify-between backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h1 className="text-white font-bold text-sm">Live Payment Tracker</h1>
            <p className="text-slate-500 text-xs">Real-time cross-border settlement</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {overallStatus === 'processing' && (
            <motion.div
              className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-3 py-1"
              animate={{ opacity: [0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-xs text-primary-300 font-medium">LIVE</span>
            </motion.div>
          )}
          {overallStatus === 'complete' && (
            <div className="flex items-center gap-2 bg-success-500/10 border border-success-500/30 rounded-full px-3 py-1">
              <CheckCircle className="w-3 h-3 text-success-400" />
              <span className="text-xs text-success-400 font-medium">COMPLETE</span>
            </div>
          )}
          {txnId && (
            <span className="text-xs font-mono text-slate-600 hidden sm:block">{txnId.slice(0, 12)}…</span>
          )}
        </div>
      </div>

      {/* ── Progress bar ────────────────────────── */}
      <div className="h-0.5 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-success-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      {/* ── Main layout ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── MAP AREA ────────────────────────────── */}
        <div className="flex-1 relative min-h-[400px]">
          <LeafletMap
            milestones={MILESTONES}
            milestoneStates={milestones}
            onHover={setHoveredMilestone}
          />

          {/* Hover card overlay */}
          <AnimatePresence>
            {hoveredMeta && hoveredState && (
              <motion.div
                key={hoveredMeta.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
              >
                <div className="bg-slate-900/95 border border-white/10 rounded-2xl px-5 py-4 shadow-2xl min-w-[240px] backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{hoveredMeta.icon}</span>
                    <div>
                      <div className="text-white font-bold text-sm">{hoveredMeta.label}</div>
                      <div className="text-slate-400 text-xs">{hoveredMeta.country}</div>
                    </div>
                    <StatusPill status={hoveredState.status} />
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{hoveredMeta.description}</p>
                  {hoveredState.timestamp && (
                    <div className="mt-2 text-xs text-success-400 font-mono">✓ Completed at {hoveredState.timestamp}</div>
                  )}
                  {hoveredState.status === 'active' && (
                    <div className="mt-2 text-xs text-primary-400 animate-pulse">● Processing now… {elapsedSec}s elapsed</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active step banner */}
          <AnimatePresence>
            {activeStep && overallStatus === 'processing' && (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]"
              >
                <div className="flex items-center gap-2 bg-primary-600/90 backdrop-blur-md border border-primary-400/30 rounded-full px-4 py-2 shadow-glow">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                  <span className="text-white text-xs font-semibold">
                    {activeStep.label} — {activeStep.description}
                  </span>
                </div>
              </motion.div>
            )}
            {overallStatus === 'complete' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]"
              >
                <div className="flex items-center gap-2 bg-success-600/90 backdrop-blur-md border border-success-400/30 rounded-full px-5 py-2 shadow-glow-success">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">🎉 Payment Delivered in {elapsedSec}s!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT SIDEBAR ───────────────────────── */}
        <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col overflow-y-auto hidden lg:flex">
          {/* Timer block */}
          <div className="p-5 border-b border-white/5">
            <div className="text-center">
              <div className="text-5xl font-mono font-bold mb-1">
                <span className={
                  overallStatus === 'complete' ? 'text-success-400' :
                  elapsed > 6000 ? 'text-green-400' :
                  elapsed > 3000 ? 'text-yellow-400' : 'text-primary-400'
                }>
                  {elapsedSec}s
                </span>
              </div>
              <div className="text-slate-400 text-xs">
                {overallStatus === 'complete' ? 'Settlement Time' : overallStatus === 'failed' ? 'Transaction Failed' : 'Processing…'}
              </div>
            </div>

            {/* Progress ring */}
            <div className="mt-4 relative flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6" />
                <motion.circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke={overallStatus === 'complete' ? '#10B981' : '#2563EB'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progress / 100) }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-white font-bold text-lg num">{progress}%</div>
                <div className="text-slate-500 text-xs">done</div>
              </div>
            </div>
          </div>

          {/* Transaction details */}
          <div className="p-5 border-b border-white/5">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Transaction</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Amount', value: `₹${txnDetails.amount.toLocaleString('en-IN')}`, icon: '💸' },
                { label: 'Recipient', value: txnDetails.recipientName, icon: '👤' },
                { label: 'Receiving', value: `${txnDetails.targetCurrency} ${(txnDetails.amount * txnDetails.rate).toFixed(2)}`, icon: '💱' },
                { label: 'Rate', value: `1 INR = ${txnDetails.rate} AED`, icon: '📊', mono: true },
                { label: 'Fee', value: `₹${txnDetails.fee} (2%)`, icon: '🏷️' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs flex items-center gap-1.5">
                    <span>{r.icon}</span>{r.label}
                  </span>
                  <span className={`text-xs font-semibold text-white ${r.mono ? 'font-mono' : ''}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones list */}
          <div className="p-5 flex-1">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Pipeline</span>
              <span className="num text-slate-600">{completedCount}/{MILESTONES.length}</span>
            </h3>
            <div className="space-y-1">
              {MILESTONES.map((m, i) => {
                const ms = milestones.find(x => x.step === m.id)!;
                const isLast = i === MILESTONES.length - 1;
                return (
                  <div key={m.id} className="relative">
                    {!isLast && (
                      <div className={`absolute left-[1.1rem] top-9 w-0.5 h-4 transition-colors duration-500 ${ms.status === 'completed' ? 'bg-success-500' : 'bg-slate-700'}`} />
                    )}
                    <motion.div
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${ms.status === 'active' ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-white/5'}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      {/* Icon circle */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm transition-all duration-500 relative ${
                        ms.status === 'completed' ? 'bg-success-500' :
                        ms.status === 'active' ? 'bg-primary-500/20 border border-primary-500/50' :
                        'bg-slate-800 border border-slate-700'
                      }`}>
                        {ms.status === 'completed' ? '✓' :
                         ms.status === 'active' ? <Loader2 className="w-4 h-4 text-primary-400 animate-spin" /> :
                         m.icon}
                        {ms.status === 'active' && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border border-primary-500/50"
                            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold truncate ${
                          ms.status === 'completed' ? 'text-success-400' :
                          ms.status === 'active' ? 'text-white' : 'text-slate-500'
                        }`}>{m.label}</div>
                        <div className="text-xs text-slate-600 truncate">
                          {ms.timestamp ? `✓ ${ms.timestamp}` : ms.status === 'active' ? 'Processing…' : 'Queued'}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.span
                          key={ms.status}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            ms.status === 'completed' ? 'bg-success-500/20 text-success-400' :
                            ms.status === 'active' ? 'bg-primary-500/20 text-primary-300' :
                            'bg-slate-700 text-slate-500'
                          }`}
                        >
                          {ms.status === 'completed' ? 'DONE' : ms.status === 'active' ? 'LIVE' : 'WAIT'}
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats bottom */}
          <div className="p-5 border-t border-white/5">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Nodes', value: `${Math.min(completedCount * 2, 12)}/12`, icon: <Globe className="w-3 h-3" /> },
                { label: 'Confirms', value: `${Math.min(completedCount, 3)}/3`, icon: <CheckCircle className="w-3 h-3" /> },
                { label: 'Pool', value: '87%', icon: <TrendingUp className="w-3 h-3" /> },
              ].map(s => (
                <div key={s.label} className="bg-slate-800 rounded-xl p-2">
                  <div className="text-slate-500 flex justify-center mb-1">{s.icon}</div>
                  <div className="text-white font-bold text-xs num">{s.value}</div>
                  <div className="text-slate-600 text-[10px]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile Timeline (shown on small screens) ── */}
      <div className="lg:hidden border-t border-white/5 bg-slate-900 p-4">
        {/* Mobile timer + progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-white font-bold font-mono">{elapsedSec}s</span>
          </div>
          <div className="flex-1 mx-4 bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-success-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <span className="text-slate-400 text-sm font-bold">{progress}%</span>
        </div>

        {/* Horizontal milestones */}
        <div className="flex items-center gap-0">
          {MILESTONES.map((m, i) => {
            const ms = milestones.find(x => x.step === m.id)!;
            const isLast = i === MILESTONES.length - 1;
            return (
              <div key={m.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 relative ${
                      ms.status === 'completed' ? 'bg-success-500 border-success-500 text-white' :
                      ms.status === 'active' ? 'bg-primary-500/20 border-primary-500 text-primary-400' :
                      'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                    animate={ms.status === 'active' ? { boxShadow: ['0 0 0 0 rgba(37,99,235,0.4)', '0 0 0 10px rgba(37,99,235,0)', '0 0 0 0 rgba(37,99,235,0)'] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {ms.status === 'completed' ? '✓' : m.icon}
                  </motion.div>
                  <span className="text-[9px] text-slate-500 mt-1 text-center leading-tight max-w-[52px]">{m.country.split(',')[0]}</span>
                </div>
                {!isLast && (
                  <div className={`h-0.5 flex-1 mx-1 rounded transition-colors duration-500 ${ms.status === 'completed' ? 'bg-success-500' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// StatusPill helper
// ──────────────────────────────────────────────
function StatusPill({ status }: { status: 'pending' | 'active' | 'completed' }) {
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
        status === 'completed' ? 'bg-success-500/20 text-success-400' :
        status === 'active' ? 'bg-primary-500/20 text-primary-300' :
        'bg-slate-700 text-slate-500'
      }`}
    >
      {status.toUpperCase()}
    </motion.span>
  );
}

// ──────────────────────────────────────────────
// Export with Suspense
// ──────────────────────────────────────────────
export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackPageInner />
    </Suspense>
  );
}
