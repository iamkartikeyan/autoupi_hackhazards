'use client';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArchitectureControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  onTogglePlay: () => void;
  onRestart: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ArchitectureControls({
  isPlaying,
  currentStep,
  totalSteps,
  onTogglePlay,
  onRestart,
  onPrev,
  onNext
}: ArchitectureControlsProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[2rem] mt-8 shadow-2xl">
      {/* Step Indicators */}
      <div className="flex items-center gap-1.5 order-2 md:order-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentStep ? 'w-8 bg-primary-500 shadow-[0_0_10px_#3b82f6]' : 
              i < currentStep ? 'w-4 bg-success-500/50' : 'w-4 bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-4 order-1 md:order-2">
        <button 
          onClick={onPrev}
          disabled={currentStep === 0}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-20 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <button 
          onClick={onTogglePlay}
          className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_#3b82f6]/30 group"
        >
          {isPlaying ? (
            <Pause size={28} className="text-white fill-white" />
          ) : (
            <Play size={28} className="text-white fill-white translate-x-0.5" />
          )}
        </button>

        <button 
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-20 flex items-center justify-center"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>

      {/* Auxiliary Controls */}
      <div className="order-3">
        <button 
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-[0.2em] text-white/80 group"
        >
          <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          Restart Flow
        </button>
      </div>
    </div>
  );
}
