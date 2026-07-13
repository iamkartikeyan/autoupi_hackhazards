'use client';
import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Environment, Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import ArchitectureNode from './ArchitectureNode';
import ArchitecturePath from './ArchitecturePath';
import MoneyParticles from './MoneyParticles';
import { ARCHITECTURE_NODES } from '@/lib/architecture-data';

interface Architecture3DProps {
  currentStep: number;
  comparisonMode: 'autopupi' | 'swift';
  onNodeClick: (node: any) => void;
}

export default function Architecture3D({
  currentStep,
  comparisonMode,
  onNodeClick
}: Architecture3DProps) {
  // Define paths based on nodes
  const paths = useMemo(() => {
    const p = [];
    for (let i = 0; i < ARCHITECTURE_NODES.length - 1; i++) {
      p.push({
        id: `path-${i}`,
        start: ARCHITECTURE_NODES[i].position,
        end: ARCHITECTURE_NODES[i + 1].position,
        status: i < currentStep ? 'completed' : i === currentStep ? 'active' : 'pending'
      });
    }
    return p;
  }, [currentStep]);

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative">
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 45 }}
        gl={{ antialias: true, stencil: false, depth: true }}
      >
        <color attach="background" args={['#020617']} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.4} far={10} color="#000000" />
        <Environment preset="night" />

        {/* Nodes */}
        {ARCHITECTURE_NODES.map((node, i) => (
          <ArchitectureNode
            key={node.id}
            position={node.position}
            name={node.name}
            color={node.color}
            size={node.size}
            icon={node.icon}
            isActive={i === currentStep}
            isCompleted={i < currentStep}
            onClick={() => onNodeClick(node)}
          />
        ))}

        {/* Paths */}
        {paths.map((path) => (
          <ArchitecturePath
            key={path.id}
            start={path.start}
            end={path.end}
            status={path.status as any}
            progress={1}
          />
        ))}

        {/* Particles */}
        {paths.map((path, i) => (
          <MoneyParticles
            key={`particles-${i}`}
            start={path.start}
            end={path.end}
            status={path.status as any}
            color={path.status === 'completed' ? '#10B981' : '#2563EB'}
            speed={comparisonMode === 'autopupi' ? 2 : 0.2}
          />
        ))}

        {/* Ground Plain Grid */}
        <gridHelper args={[50, 50, '#1e293b', '#0f172a']} position={[0, -2, 0]} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      {/* Floating Speed Comparison Badge */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-6 py-3 rounded-2xl pointer-events-none">
        <div className={`w-3 h-3 rounded-full animate-pulse ${comparisonMode === 'autopupi' ? 'bg-primary-500 shadow-[0_0_10px_#3b82f6]' : 'bg-danger-500 shadow-[0_0_10px_#ef4444]'}`} />
        <span className="text-sm font-black uppercase tracking-widest text-white/80">
          {comparisonMode === 'autopupi' ? 'AutoPay: 40 Seconds' : 'SWIFT: 3-5 Days'}
        </span>
      </div>

      {/* HUD Info */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">System Visualization v2.0</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500" />
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Active Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-500" />
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Settled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
