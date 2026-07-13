'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Clock, Zap, Info } from 'lucide-react';

interface ArchitectureInfoPanelProps {
  selectedNode: any | null;
  onClose: () => void;
}

export default function ArchitectureInfoPanel({
  selectedNode,
  onClose
}: ArchitectureInfoPanelProps) {
  if (!selectedNode) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="absolute top-6 bottom-6 right-6 w-[360px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 z-50 overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-white/60" />
        </button>

        <div className="flex items-center gap-4 mb-8">
           <div className="text-4xl p-4 bg-white/5 border border-white/10 rounded-2xl">
              <selectedNode.icon size={32} style={{ color: selectedNode.color }} />
           </div>
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Architecture Node</div>
              <h2 className="text-2xl font-black text-white">{selectedNode.name}</h2>
           </div>
        </div>

        <div className="space-y-6">
           <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80 mb-3 flex items-center gap-2">
                 <Info size={16} className="text-primary-500" /> Description
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{selectedNode.info.description}</p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5 font-bold">
                    <Clock size={12} /> Time
                 </div>
                 <div className="text-lg font-black text-white">{selectedNode.info.time}</div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5 font-bold">
                    <Zap size={12} /> Sync
                 </div>
                 <div className="text-lg font-black text-primary-400">Real-time</div>
              </div>
           </div>

           <div className="p-6 bg-primary-500/5 border border-primary-500/20 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary-400 mb-3 flex items-center gap-2">
                 <ShieldCheck size={16} /> Compliance
              </h3>
              <div className="text-white text-sm font-bold mb-1">{selectedNode.info.compliance}</div>
              <div className="text-slate-500 text-[11px] leading-snug">{selectedNode.info.safety}</div>
           </div>
        </div>

        {/* Transaction Trace */}
        <div className="mt-12 pt-8 border-t border-white/5">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Deep Trace Proof</div>
           <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-primary-400/80 break-all leading-relaxed border border-white/5">
              SETTLEMENT_TXN_0x1234_{selectedNode.id.toUpperCase()}_7890_CONFIRMED_AT_TIMESTAMP_{Date.now()}
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
