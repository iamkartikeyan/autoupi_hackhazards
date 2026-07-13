'use client';
import { motion } from 'framer-motion';
import { Rocket, Turtle } from 'lucide-react';

interface ArchitectureComparisonProps {
  mode: 'autopupi' | 'swift';
  onToggle: (mode: 'autopupi' | 'swift') => void;
}

export default function ArchitectureComparison({
  mode,
  onToggle
}: ArchitectureComparisonProps) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-md p-2 rounded-[1.5rem] shadow-2xl">
      <button 
        onClick={() => onToggle('autopupi')}
        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group ${
          mode === 'autopupi' ? 'bg-primary-500 text-white shadow-[0_0_20px_#3b82f6]/30' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Rocket size={16} className={mode === 'autopupi' ? 'animate-bounce' : ''} />
        AutoPay Mode
      </button>

      <button 
        onClick={() => onToggle('swift')}
        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group ${
          mode === 'swift' ? 'bg-danger-500 text-white shadow-[0_0_20px_#ef4444]/30' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Turtle size={16} className={mode === 'swift' ? 'animate-pulse' : ''} />
        Legacy SWIFT
      </button>
    </div>
  );
}
