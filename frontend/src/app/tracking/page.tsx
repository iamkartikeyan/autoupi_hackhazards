'use client';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Zap, ShieldCheck, Globe } from 'lucide-react';
import NotificationPanel from '@/components/features/NotificationPanel';
import BrandLogo from '@/components/ui/BrandLogo';

function TrackingPageInner() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-4 relative overflow-x-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary-500/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-6xl z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm uppercase tracking-widest">Back to Dashboard</span>
            </button>
            <h1 className="text-5xl font-black tracking-tighter">Live Alert Center</h1>
            <div className="flex flex-wrap gap-3">
              <span className="badge-primary flex items-center gap-1.5 py-1 px-4 !bg-primary-500/20 !border-primary-500/30 text-primary-400">
                <Zap size={14} /> Real-time Sync
              </span>
              <span className="badge-success flex items-center gap-1.5 py-1 px-4 !bg-success-500/20 !border-success-500/30 text-success-400">
                <ShieldCheck size={14} /> Twilio Verified
              </span>
              <span className="badge-info flex items-center gap-1.5 py-1 px-4 !bg-blue-500/20 !border-blue-500/30 text-blue-400">
                <Globe size={14} /> Global Delivery
              </span>
            </div>
          </div>
          <div className="hidden lg:block relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
             <div className="relative bg-slate-900 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-2xl">🔔</div>
                <div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Monitoring</div>
                   <div className="text-xl font-black text-white">99.9% Reliability</div>
                </div>
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-md">
           <NotificationPanel />
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
           <div className="card-glass p-8">
              <div className="text-3xl mb-4">📢</div>
              <h3 className="text-xl font-black mb-2">Automated SMS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                 Every transaction step sends an automated SMS to both sender and recipient for full visibility.
              </p>
           </div>
           <div className="card-glass p-8">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-xl font-black mb-2">Email Proofs</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                 Detailed PDF receipts and settlement proofs are delivered to your inbox within seconds.
              </p>
           </div>
           <div className="card-glass p-8">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-black mb-2">Secure Reserve</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                 Receive instant verification when your INR reserve is locked safely in the bank vault.
              </p>
           </div>
        </div>
      </div>

      {/* Footer Watermark */}
      <div className="mt-24 opacity-20 flex items-center gap-4">
         <BrandLogo size={24} grayscale />
         <div className="h-4 w-[1px] bg-white" />
         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Alert Monitoring System v2.0</span>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={null}>
      <TrackingPageInner />
    </Suspense>
  );
}
