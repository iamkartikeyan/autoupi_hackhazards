'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Landmark, Lock, Coins, 
  Activity, Flame, CheckCircle, Info,
  ShieldCheck, Globe, Zap
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types & Data
// ──────────────────────────────────────────────
interface TokenStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  compliance: string;
  color: string;
  label?: string;
}

const TOKEN_STEPS: TokenStep[] = [
  {
    id: 'fiat_in',
    title: 'Fiat In',
    description: 'User Pays via UPI/IMPS',
    icon: Landmark,
    compliance: 'ISO 20022 compliant messaging. Routed through NPCI gateway.',
    color: 'text-blue-400',
    label: '₹10,000 INR Received'
  },
  {
    id: 'reserve_lock',
    title: 'Reserve Lock',
    description: 'Bank Locks Reserve',
    icon: Lock,
    compliance: 'DICGC Insured (₹5 Lakh). Bank-to-Bank credit confirmation.',
    color: 'text-amber-400',
    label: 'Collateral Locked'
  },
  {
    id: 'token_mint',
    title: 'Token Mint',
    description: 'TBD Tokens Minted',
    icon: Coins,
    compliance: '1:1 Backing Ratio. Classified as Bank Deposit, not Crypto.',
    color: 'text-success-400',
    label: '10,000 TBD Issued'
  },
  {
    id: 'travel',
    title: 'Protocol Travel',
    description: 'Blockchain Movement',
    icon: Activity,
    compliance: 'L2 Settlement Channel (GIFT City). Hash recorded for audit.',
    color: 'text-primary-400',
    label: '0x12a8...3b92'
  },
  {
    id: 'burn_payout',
    title: 'Burn + Payout',
    description: 'Recipient Gets USD',
    icon: Flame,
    compliance: 'Target Node Payout. Token burned to release collateral.',
    color: 'text-danger-400',
    label: 'Final Settlement'
  }
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function TokenVisualization({ activeStep = 0 }) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-xl group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" /> Token Lifecycle
          </h3>
          <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Real-time Settlement Engine</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success-500" /> Done</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" /> Live</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-800" /> Wait</div>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 py-8">
        
        {/* Connection Line (Desktop) */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 hidden lg:block overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-success-500 via-primary-500 to-transparent"
            animate={{ width: `${(activeStep / (TOKEN_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* Steps */}
        {TOKEN_STEPS.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className="relative flex-1 w-full lg:w-auto"
              onMouseEnter={() => setHoveredStep(idx)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Vertical line for mobile */}
              {idx < TOKEN_STEPS.length - 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full h-12 w-0.5 bg-slate-800 lg:hidden overflow-hidden">
                   <motion.div 
                      className="w-full bg-primary-500"
                      initial={{ height: 0 }}
                      animate={{ height: isCompleted ? '100%' : 0 }}
                   />
                </div>
              )}

              <div className="flex lg:flex-col items-center gap-4 lg:gap-4 relative z-10 w-full">
                {/* Node */}
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isCompleted ? 'rgb(34, 197, 94)' : isActive ? 'rgb(99, 102, 241)' : 'rgb(30, 41, 59)'
                  }}
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border-2 ${
                    isCompleted ? 'border-success-400' : isActive ? 'border-primary-400 shadow-glow' : 'border-slate-800'
                  } transition-colors relative cursor-help`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-7 h-7 text-white" />
                  ) : (
                    <Icon className={`w-6 h-6 lg:w-7 lg:h-7 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  )}

                  {/* Ripple animation for active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary-500 animate-ping opacity-40" />
                  )}

                  {/* Tooltip Popup */}
                  <AnimatePresence>
                    {hoveredStep === idx && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 p-4 bg-slate-950 border border-white/20 rounded-xl shadow-2xl z-50 pointer-events-none"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-primary-400" />
                          <span className="text-[10px] font-black uppercase text-slate-400">Compliance & Security</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">{step.compliance}</p>
                        <div className="w-3 h-3 bg-slate-950 border-r border-b border-white/20 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 lg:text-center">
                  <h4 className={`text-sm lg:text-base font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {step.title}
                  </h4>
                  <p className="text-[10px] lg:text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                    {step.description}
                  </p>
                  
                  {/* Status Badges */}
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-2"
                      >
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/10 ${step.color}`}>
                          {step.label}
                        </span>
                        {step.id === 'token_mint' && (
                          <div className="text-[8px] text-slate-400 font-black mt-1 uppercase">Not Crypto • FDIC Equiv</div>
                        )}
                        {step.id === 'reserve_lock' && (
                          <div className="flex items-center gap-1 justify-center mt-1">
                            <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-black italic">DICGC INSURED</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Elements based on active step */}
      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
             <Globe className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Node Status</div>
            <div className="text-xs text-white font-mono">Mumbai Hub {'>>'} GIFT City {'>>'} Dubai Node</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeStep === 0 && <span className="text-xs text-blue-400 font-bold italic animate-pulse">Waiting for Payment Confirmation...</span>}
          {activeStep === 1 && <span className="text-xs text-amber-400 font-bold italic animate-pulse">Securing Reserves in Escrow...</span>}
          {activeStep === 2 && <span className="text-xs text-success-400 font-bold italic animate-pulse">Minting Audit-Ready Tokens...</span>}
          {activeStep === 3 && <span className="text-xs text-primary-400 font-bold italic animate-pulse">Routing via L2 Protocol...</span>}
          {activeStep === 4 && <span className="text-xs text-success-500 font-bold italic">Settlement Successfully Dispersed!</span>}
        </div>
      </div>
    </div>
  );
}
