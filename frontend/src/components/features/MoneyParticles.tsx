'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MoneyParticlesProps {
  count?: number;
  status: 'pending' | 'active' | 'completed';
  start: [number, number, number];
  end: [number, number, number];
  speed?: number;
  color?: string;
}

export default function MoneyParticles({
  count = 100,
  status,
  start,
  end,
  speed = 1,
  color = '#10B981'
}: MoneyParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const vStart = useMemo(() => new THREE.Vector3(...start), [start]);
  const vEnd = useMemo(() => new THREE.Vector3(...end), [end]);
  
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3().lerpVectors(vStart, vEnd, 0.5);
    midPoint.y += 2;
    return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
  }, [vStart, vEnd]);

  // Initial particle states
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      offset: Math.random(), // initial position along curve
      speed: (0.1 + Math.random() * 0.1) * speed,
      size: 0.05 + Math.random() * 0.1
    }));
  }, [count, speed]);

  const dummy = new THREE.Object3D();

  useFrame((state) => {
    if (!meshRef.current || status !== 'active') return;

    particles.forEach((p, i) => {
      // Update offset based on time
      p.offset += p.speed * 0.05;
      if (p.offset > 1) p.offset = 0;

      const pos = curve.getPoint(p.offset);
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.scale.set(p.size, p.size, p.size);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (status === 'pending') return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={1} 
        transparent 
        opacity={0.8} 
      />
    </instancedMesh>
  );
}
