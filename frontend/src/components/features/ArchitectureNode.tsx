'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ArchitectureNodeProps {
  position: [number, number, number];
  name: string;
  color: string;
  size: number;
  icon: any;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export default function ArchitectureNode({
  position,
  name,
  color,
  size,
  icon: Icon,
  isActive,
  isCompleted,
  onClick
}: ArchitectureNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isActive) {
      meshRef.current.rotation.y += 0.02;
    }
    const targetScale = hovered ? 1.2 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group position={position}>
      {/* Node Body */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
          ref={meshRef} 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {name.toLowerCase().includes('bank') ? (
            <boxGeometry args={[size, size, size]} />
          ) : (
            <sphereGeometry args={[size * 0.6, 32, 32]} />
          )}
          
          <MeshDistortMaterial 
            color={isCompleted ? '#10B981' : color} 
            speed={isActive ? 3 : 0} 
            distort={0.2}
            emissive={isActive ? color : '#000'}
            emissiveIntensity={isActive ? 1.5 : 0}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Label */}
      <Billboard position={[0, size + 1.2, 0]}>
        <Text
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Billboard>

      {/* Status Ring */}
      {isActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[size * 0.8, size * 1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
