'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { 
  Building2, 
  Plane, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Turtle, 
  Rocket,
  ShieldCheck,
  Globe,
  Coins,
  Link as LinkIcon,
  Info,
  Landmark
} from 'lucide-react';

const SWIFT_STEPS = [
  { id: 1, label: 'Initiated', time: 'Day 1', icon: Building2, desc: 'Sender bank processes request and prepares SWIFT message.', details: 'Manual verification, compliance checks, and liquidity reservation at origin bank.' },
  { id: 2, label: 'In Transit', time: 'Day 2', icon: Plane, desc: 'Funds move to Intermediary bank.', details: 'Transfer through regional clearing systems. Intermediary banks take their 0.5-1% cut.' },
  { id: 3, label: 'Processing', time: 'Day 3', icon: Landmark, desc: 'Correspondent bank clearing.', details: 'Nostro/Vostro account reconciliation between banks in different jurisdictions.' },
  { id: 4, label: 'In Transit', time: 'Day 4', icon: Plane, desc: 'Final leg to recipient bank.', details: 'Second intermediary layer for exotic currency pairs or small-town banks.' },
  { id: 5, label: 'Received', time: 'Day 5', icon: CheckCircle2, desc: 'Recipient credited.', details: 'Final settlement and local currency credit. Total time: 120+ hours.' },
];

const AUTO_UPI_STEPS = [
  { id: 1, label: 'Initiated', time: '0:00', icon: Building2, desc: 'UPI Payment detected.', details: 'Real-time IMPS/UPI detection from user mobile app.' },
  { id: 2, label: 'Tokens Minted', time: '0:15', icon: Coins, desc: 'Digital Reserve Lock.', details: 'INR locked in RBI-regulated bank; TBD tokens minted 1:1 instantly.' },
  { id: 3, label: 'FX Converted', time: '0:30', icon: Globe, desc: 'GIFT City Settlement.', details: 'Institutional forex conversion at IFSC Gandhinagar with 0% spread.' },
  { id: 4, label: 'Settled', time: '0:45', icon: LinkIcon, desc: 'Blockchain Proof.', details: 'Transaction finalized on private institutional ledger with zero latency.' },
  { id: 5, label: 'Received', time: '1:00', icon: CheckCircle2, desc: 'Funds in Wallet.', details: 'Recipient receives local currency instantly. Total time: 60 seconds.' },
];

export default function TimelineComparison() {
  const [hoveredStep, setHoveredStep] = useState<{ type: 'swift' | 'autoupi', id: number } | null>(null);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden italic-none">
      <div className="flex flex-col lg:row items-center justify-between mb-16 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">The Speed Gap</h2>
          <p className="text-slate-400">Comparing 50 years of legacy vs. 8 seconds of innovation.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
             <span className="text-xl font-bold text-white leading-none">8,640x</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Faster</span>
          </div>
        </div>
      </div>

      <div className="space-y-24 relative">
        {/* SWIFT Timeline */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-danger-500/20 text-danger-400 rounded-lg">
              <Turtle className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Traditional SWIFT (5 Days)</span>
          </div>

          <div className="relative flex justify-between items-start">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-800" />
            
            {/* Animated Progress Line */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 15, ease: 'linear', repeat: Infinity }}
              className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-danger-500 to-warning-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              style={{ maxWidth: 'calc(100% - 48px)' }}
            />

            {SWIFT_STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                className="relative z-10 flex flex-col items-center group cursor-help"
                onMouseEnter={() => setHoveredStep({ type: 'swift', id: step.id })}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 2.5 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    hoveredStep?.type === 'swift' && hoveredStep.id === step.id 
                    ? 'bg-danger-500 border-white text-white scale-110' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 group-hover:border-danger-400'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </motion.div>
                <div className="mt-4 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{step.time}</div>
                  <div className="text-xs font-bold text-slate-300">{step.label}</div>
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredStep?.type === 'swift' && hoveredStep.id === step.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-20 w-48 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl z-50 pointer-events-none"
                    >
                      <div className="text-danger-400 text-[10px] font-black uppercase mb-1">Intermediary Lag</div>
                      <div className="text-xs text-slate-400 leading-relaxed font-medium">
                        {step.details}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* AutoUPI Timeline */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-success-500/20 text-success-400 rounded-lg">
              <Rocket className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">AutoUPI Protocol (60 Seconds)</span>
          </div>

          <div className="relative flex justify-between items-start">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-800" />
            
            {/* Animated Progress Line */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
              className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-success-500 to-primary-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              style={{ maxWidth: 'calc(100% - 48px)' }}
            />

            {AUTO_UPI_STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                className="relative z-10 flex flex-col items-center group cursor-help"
                onMouseEnter={() => setHoveredStep({ type: 'autoupi', id: step.id })}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.5 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    hoveredStep?.type === 'autoupi' && hoveredStep.id === step.id 
                    ? 'bg-success-500 border-white text-white scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 group-hover:border-success-400'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </motion.div>
                <div className="mt-4 text-center">
                  <div className="text-[10px] font-bold text-success-500 uppercase mb-1">{step.time}s</div>
                  <div className="text-xs font-bold text-slate-300">{step.label}</div>
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredStep?.type === 'autoupi' && hoveredStep.id === step.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-20 w-48 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl z-50 pointer-events-none"
                    >
                      <div className="text-success-400 text-[10px] font-black uppercase mb-1">Instant Settlement</div>
                      <div className="text-xs text-slate-400 leading-relaxed font-medium">
                        {step.details}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Stats Footer */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
        {[
          { label: 'Settlement Efficiency', val: '8,640x', sub: 'Faster than SWIFT', icon: Zap, color: 'text-primary-400' },
          { label: 'Transfer Costs', val: '95%', sub: 'Reduction in Fees', icon: ShieldCheck, color: 'text-success-400' },
          { label: 'Transparency', val: '100%', sub: 'Real-time Trackable', icon: Globe, color: 'text-accent-400' }
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
            <div className={`p-3 bg-white/5 rounded-2xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
