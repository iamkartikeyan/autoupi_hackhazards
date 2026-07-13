'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ArchitecturePathProps {
  start: [number, number, number];
  end: [number, number, number];
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

export default function ArchitecturePath({
  start,
  end,
  status,
  progress
}: ArchitecturePathProps) {
  const lineRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    const midPoint = new THREE.Vector3().lerpVectors(vStart, vEnd, 0.5);
    midPoint.y += 2; // Arched path

    return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
  }, [start, end]);

  const tubeArgs = useMemo(() => {
    return [curve, 64, 0.05, 8, false] as const;
  }, [curve]);

  useFrame((state) => {
    if (!lineRef.current) return;
    if (status === 'active') {
      const material = lineRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
    }
  });

  const color = status === 'completed' ? '#10B981' : status === 'active' ? '#2563EB' : '#1e293b';

  return (
    <mesh ref={lineRef}>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <meshStandardMaterial 
        color={color} 
        emissive={status === 'active' ? '#3b82f6' : '#000'}
        emissiveIntensity={status === 'active' ? 1 : 0}
        transparent
        opacity={status === 'pending' ? 0.3 : 1}
      />
    </mesh>
  );
}
