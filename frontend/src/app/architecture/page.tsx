'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield, Globe, Zap, CheckCircle2, Info, Rocket, Turtle, Maximize2 } from 'lucide-react';
import Architecture3D from '@/components/features/Architecture3D';
import ArchitectureControls from '@/components/features/ArchitectureControls';
import ArchitectureInfoPanel from '@/components/features/ArchitectureInfoPanel';
import ArchitectureComparison from '@/components/features/ArchitectureComparison';
import { ANIMATION_STEPS, ARCHITECTURE_NODES } from '@/lib/architecture-data';
import BrandLogo from '@/components/ui/BrandLogo';

function ArchitecturePageInner() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'autopupi' | 'swift'>('autopupi');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Animation Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const stepData = ANIMATION_STEPS[currentStep];
      timer = setTimeout(() => {
        if (currentStep < ANIMATION_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, stepData.duration);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 group">
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-white transition-colors" />
              <BrandLogo size={32} />
            </button>
            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
            <div className="hidden md:flex flex-col">
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Architecture Visualization</h1>
              <div className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Real-time Settlement Protocol</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ArchitectureComparison 
              mode={comparisonMode} 
              onToggle={(m) => {
                setComparisonMode(m);
                setCurrentStep(0);
                setIsPlaying(false);
              }} 
            />
            <button 
              onClick={() => router.push('/send')}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_#3b82f6]/30 active:scale-95"
            >
              Back to App
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto relative group">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 3D Scene Container */}
          <div className="lg:col-span-3 space-y-6">
             <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[700px]">
                <Architecture3D 
                  currentStep={currentStep}
                  comparisonMode={comparisonMode}
                  onNodeClick={(node) => setSelectedNode(node)}
                />
                
                {/* Narration Overlay */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl text-center"
                    >
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-400 mb-2">
                        Step {currentStep + 1}: {ANIMATION_STEPS[currentStep].name}
                      </h3>
                      <p className="text-lg font-bold text-white mb-2 leading-relaxed">
                        {ANIMATION_STEPS[currentStep].narration}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Info Panel Overlay */}
                <ArchitectureInfoPanel 
                  selectedNode={selectedNode}
                  onClose={() => setSelectedNode(null)}
                />
             </div>

             <ArchitectureControls 
               isPlaying={isPlaying}
               currentStep={currentStep}
               totalSteps={ANIMATION_STEPS.length}
               onTogglePlay={() => setIsPlaying(!isPlaying)}
               onRestart={handleRestart}
               onPrev={() => setCurrentStep(prev => Math.max(0, prev - 1))}
               onNext={() => setCurrentStep(prev => Math.min(ANIMATION_STEPS.length - 1, prev + 1))}
             />
          </div>

          {/* Right Sidebar - Details Card */}
          <div className="space-y-6">
            <div className="card-glass p-8 rounded-[2.5rem] border-white/5 bg-white/5 h-full">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                    <Shield className="text-primary-400" size={20} />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-widest italic">Live Status</h2>
              </div>

              <div className="space-y-6">
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Transaction Hash</div>
                    <div className="font-mono text-[11px] text-primary-400 bg-black/30 p-4 rounded-xl border border-white/5 break-all">
                       0x4429_5FA2_D1E9_88C1_00F3_9128_B2E0
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1 leading-snug">Est. Cost</div>
                       <div className="text-sm font-black text-white">₹199 <span className="text-[10px] text-success-500">(-91%)</span></div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1 leading-snug">Est. Arrival</div>
                       <div className="text-sm font-black text-white">40 Sec</div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Regulatory Badges</div>
                    <div className="flex flex-wrap gap-2">
                       {['RBI Sandbox', 'DICGC', 'FEMA', 'GIFT City', 'DPDP'].map(badge => (
                          <span key={badge} className="px-3 py-1.5 bg-success-500/10 border border-success-500/20 text-success-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                             ✅ {badge}
                          </span>
                       ))}
                    </div>
                 </div>

                 <div className="pt-8 text-center">
                    <div className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                       "AutoPay routes via GIFT City IFSC for real-time institutional FX rates, bypassing redundant SWIFT hops."
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactivity Hint */}
      <div className="fixed bottom-10 right-10 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl shadow-2xl animate-bounce-slow">
         <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs">
                  {i === 1 ? '🖱️' : i === 2 ? '👆' : '🔍'}
               </div>
            ))}
         </div>
         <div className="text-xs font-black uppercase tracking-widest text-white/80">Interact to Explore</div>
      </div>
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <Suspense fallback={null}>
      <ArchitecturePageInner />
    </Suspense>
  );
}
