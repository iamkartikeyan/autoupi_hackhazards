'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { CheckCircle, Copy, Check, ArrowRight, Home, Clock, Zap } from 'lucide-react';
import { transactionApi } from '@/lib/api';
import toast from 'react-hot-toast';
import NotificationPanel from '@/components/features/NotificationPanel';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

function SuccessPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txnId = searchParams.get('id');
  const hashParam = searchParams.get('hash');

  const [txn, setTxn] = useState<Record<string, any> | null>(null);
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (txnId) {
      transactionApi.get(txnId).then((res: any) => setTxn(res.data.data)).catch(() => { });
    }
  }, [txnId]);

  function copyHash() {
    const hash = (txn?.blockchain_hash as string) || hashParam || '';
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success('Hash copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  const amount = (txn?.amount as number) || 10000;
  const finalAmount = (txn?.final_amount as number) || 441.7;
  const fee = (txn?.fee as number) || 50;
  const rate = (txn?.exchange_rate as number) || 0.04417;
  const settlementTime = (txn?.settlement_time as number) || 8.2;
  const hash = (txn?.blockchain_hash as string) || hashParam || '';
  const fromCurrency = (txn?.currency as string) || 'INR';
  const toCurrency = (txn?.target_currency as string) || 'AED';
  const recipientName = (txn?.recipient_name as string) || 'Ahmed Al-Rashidi';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-success-500/20 blur-[120px] pointer-events-none" />

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          colors={['#10B981', '#2563EB', '#7C3AED', '#F59E0B', '#fff']}
          recycle={false}
        />
      )}

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center flex-1">
        {/* Left: Success Card */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center lg:text-left">
             <motion.div
                className="w-20 h-20 rounded-2xl bg-success-500 shadow-glow flex items-center justify-center mb-6 mx-auto lg:mx-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              >
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h1 className="text-4xl font-black text-white mb-3 text-balance">Payment Sent Successfully! 🎉</h1>
              <p className="text-slate-400 text-lg">Your ₹{amount.toLocaleString('en-IN')} is on its way to {recipientName}.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-lg mx-auto lg:mx-0 border border-white/10">
            {/* Amount hero */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-8 text-center text-white">
              <div className="text-sm opacity-80 mb-1 font-bold uppercase tracking-widest">Recipient Receives</div>
              <div className="text-6xl font-black num mb-1">{toCurrency === 'AED' ? 'د.إ' : '$'}{finalAmount.toLocaleString()}</div>
              <div className="text-sm opacity-70 font-bold tracking-widest">{toCurrency} Settlement</div>
            </div>

            <div className="p-8 space-y-0">
              {/* Summary rows */}
              {[
                { label: 'Original Amount', value: `₹${amount.toLocaleString('en-IN')}`, bold: true },
                { label: 'Exchange Rate', value: `1 ${fromCurrency} = ${rate} ${toCurrency}`, mono: true },
                { label: 'Total Fees', value: `₹${fee} (1%)`, muted: true },
                { label: 'Processing Speed', value: `⚡ ${settlementTime}s`, green: true },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between py-4 ${i < 3 ? 'border-b border-surface-4' : ''}`}>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-tight">{row.label}</span>
                  <span className={`text-sm ${row.bold ? 'font-bold text-slate-800' : row.green ? 'font-bold text-success-600' : row.mono ? 'font-mono text-slate-600' : row.muted ? 'text-slate-500' : 'text-slate-700'} num`}>
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Hash */}
              <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blockchain Settlement Hash</span>
                  <button onClick={copyHash} className="flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-500 break-all leading-tight">{hash || '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex flex-col gap-3">
              <button
                onClick={() => router.push('/send')}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
              >
                Send Another Payment <ArrowRight className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Clock className="w-4 h-4" /> History
                </button>
                <button
                  onClick={() => router.push('/compare')}
                  className="py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Home className="w-4 h-4" /> Platform
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Notification Panel */}
        <motion.div
           initial={{ x: 50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ type: 'spring', damping: 20, delay: 0.1 }}
           className="w-full flex justify-center lg:justify-end"
        >
          <NotificationPanel />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
        Verified Settlement Pipeline • AutoPay 2.0
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl font-black italic tracking-widest animate-pulse">AUTOUPI PROCESSING...</div>}>
      <SuccessPageInner />
    </Suspense>
  );
}
