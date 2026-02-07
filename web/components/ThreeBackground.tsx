"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Center, PerspectiveCamera, OrbitControls, Stars } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function FloatingCubes() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-4, 2, -2]} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} emissive="#4f46e5" emissiveIntensity={0.2} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh position={[4, -1, -3]} rotation={[0.3, -0.3, 0.2]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#7c3aed" metalness={0.7} roughness={0.3} emissive="#7c3aed" emissiveIntensity={0.3} />
        </mesh>
      </Float>
      
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2.5}>
        <mesh position={[0, 3, -4]} rotation={[0.2, 0.8, 0.1]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#2563eb" metalness={0.9} roughness={0.1} emissive="#2563eb" emissiveIntensity={0.2} />
        </mesh>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.8}>
        <mesh position={[-3, -2, -2]} rotation={[0.7, -0.2, 0.3]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#6366f1" metalness={0.6} roughness={0.4} emissive="#6366f1" emissiveIntensity={0.3} />
        </mesh>
      </Float>
      
      <Float speed={2.2} rotationIntensity={1} floatIntensity={2.2}>
        <mesh position={[3, 2.5, -3]} rotation={[0.4, 0.6, -0.2]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} emissive="#8b5cf6" emissiveIntensity={0.2} />
        </mesh>
      </Float>

      <Float speed={1.3} rotationIntensity={0.9} floatIntensity={1.3}>
        <mesh position={[2, -3, -2]} rotation={[0.6, 0.4, 0.5]}>
          <octahedronGeometry args={[0.7]} />
          <meshStandardMaterial color="#a855f7" metalness={0.8} roughness={0.2} emissive="#a855f7" emissiveIntensity={0.4} />
        </mesh>
      </Float>

      <Float speed={1.7} rotationIntensity={0.7} floatIntensity={1.7}>
        <mesh position={[-2, 1, -3]} rotation={[0.3, 0.9, 0.1]}>
          <tetrahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function AdDisplayText() {
  return (
    <Center position={[0, 0, -2]}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4, 1.5, 0.3]} />
            <meshStandardMaterial color="#4f46e5" metalness={0.6} roughness={0.3} emissive="#4f46e5" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[3.8, 1.3, 0.1]} />
            <meshStandardMaterial color="#6366f1" metalness={0.9} roughness={0.1} emissive="#6366f1" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </Float>
    </Center>
  );
}

function ParticleField() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.6} />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#4f46e5" />
        <spotLight position={[0, 10, 0]} intensity={0.6} color="#6366f1" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ParticleField />
        <FloatingCubes />
        <AdDisplayText />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
