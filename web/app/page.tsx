'use client';

export const dynamic = 'force-dynamic';

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, OrbitControls } from "@react-three/drei";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import Link from "next/link";

function NeonBuilding({ position, height, color }: { position: [number, number, number]; height: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshStandardMaterial;
      const glow = 0.4 + Math.sin(t * 1.2 + position[0]) * 0.2;
      m.emissive = new THREE.Color(color);
      m.emissiveIntensity = glow;
      // Bobbing motion
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.05;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color="#0a0a0f" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

function ScreenPanel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshStandardMaterial;
      const hue = (0.55 + Math.sin(t * 0.3) * 0.08) % 1;
      m.color.setHSL(hue, 0.8, 0.6);
      m.emissive.setHSL(hue, 0.9, 0.5);
      m.emissiveIntensity = 0.8 + Math.sin(t * 2.0) * 0.2;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={[0, Math.PI * 0.25, 0]}>
      <planeGeometry args={[1.8, 1.0]} />
      <meshStandardMaterial color="#3bc7ff" metalness={0.4} roughness={0.1} />
    </mesh>
  );
}

// CTA Background with 3D Elements
function CTABackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <>
      {/* Floating Digital Billboards */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`billboard-${i}`}
          className="absolute rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 backdrop-blur-sm"
          style={{
            width: `${60 + Math.random() * 80}px`,
            height: `${40 + Math.random() * 60}px`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            x: [0, mousePosition.x * 20, 0],
            y: [0, mousePosition.y * 20, 0],
            rotate: [0, Math.random() * 10 - 5, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Billboard Content */}
          <div className="p-3 text-white/80 text-xs">
            <div className="font-bold mb-1">DIGITAL OUTDOOR</div>
            <div className="text-[8px]">BENGALURU • 24/7</div>
          </div>
        </motion.div>
      ))}
      
      {/* Abstract City Silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <div className="flex items-end justify-center h-full gap-8">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`building-${i}`}
              className="bg-gradient-to-t from-gray-800 to-gray-700 w-8 md:w-12"
              style={{
                height: `${40 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Holographic Light Waves */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
          style={{
            top: `${20 + i * 20}%`,
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Moving Data Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      {/* Soft Volumetric Fog */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 to-transparent pointer-events-none" />
      
      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 50,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />
    </>
  );
}

// Floating Particles Component
function FloatingParticles() {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            x: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Data Stream Lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-blue-400/20 to-purple-400/20"
          style={{
            width: `${20 + Math.random() * 30}%`,
            left: `${Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            x: [-50, window.innerWidth],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

// 3D Icon Components
function LockIcon() {
  return (
    <div className="relative">
      <motion.div 
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </motion.div>
      
      {/* Floating Coins */}
      <motion.div 
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
        }}
      >
        <span className="text-xs font-bold text-gray-900">₹</span>
      </motion.div>
    </div>
  );
}

function CloudIcon() {
  return (
    <div className="relative">
      <motion.div 
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </motion.div>
      
      {/* Data Streams */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-8 bg-cyan-400"
          style={{
            left: `${20 + i * 30}%`,
            bottom: '-2rem',
          }}
          animate={{
            height: ['0px', '2rem', '0px'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <div className="relative">
      <motion.div 
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          
          {/* Screen Frame */}
          <div className="absolute inset-0 rounded-xl border-2 border-white/30" />
        </div>
      </motion.div>
    </div>
  );
}

function ChartIcon() {
  return (
    <div className="relative">
      <motion.div 
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)]"
        animate={{
          rotateX: [0, 10, 0],
          rotateY: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </motion.div>
      
      {/* Data Cubes */}
      <motion.div 
        className="absolute -top-1 -right-1 w-4 h-4 rounded bg-blue-400 opacity-70"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.div 
        className="absolute -bottom-1 -left-1 w-3 h-3 rounded bg-purple-400 opacity-70"
        animate={{
          y: [0, 5, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          delay: 0.7,
        }}
      />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ title, description, icon, color, delay }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string; 
  delay: number; 
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.23, 1, 0.32, 1] 
      }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`
        relative rounded-2xl p-6 border backdrop-blur-xl
        bg-gradient-to-br from-gray-900/70 to-gray-800/70
        border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        transition-all duration-500
        ${isHovered ? 'shadow-[0_20px_50px_rgba(59,130,246,0.3)] border-white/40' : ''}
      `}>
        {/* Glow Effect */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500
          ${isHovered ? 'opacity-20' : ''}
        `} style={{
          background: `radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, transparent 70%)`
        }} />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            {icon}
          </div>
          
          {/* Title */}
          <h3 className={`text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-white/70 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Connecting Lines (Desktop only) */}
      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/20 to-transparent" />
    </motion.div>
  );
}

// Navigation Link Component with Active State
function NavLink({ 
  children, 
  href, 
  exact = false, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  href: string; 
  exact?: boolean; 
  delay?: number; 
}) {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const checkActive = () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isActive = exact ? currentPath === href : currentPath.startsWith(href);
        setIsActive(isActive);
      }
    };
    
    checkActive();
    window.addEventListener('popstate', checkActive);
    return () => window.removeEventListener('popstate', checkActive);
  }, [href, exact]);
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        href={href}
        className={`px-4 py-2 rounded-lg transition-all duration-300 relative group ${
          isActive 
            ? 'text-white' 
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        style={{ lineHeight: '1.4' }}
        onClick={(e) => {
          // Prevent default for same-page navigation to avoid reload
          if (href === window.location.pathname) {
            e.preventDefault();
          }
        }}
      >
        <span className="relative z-10">{children}</span>
        
        {/* 3D Depth Effect */}
        {isActive && (
          <div className="absolute inset-0 rounded-lg bg-white/5 transform translate-y-0.5 blur-sm" />
        )}
        
        {/* Active Indicator */}
        {isActive && (
          <motion.div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            layoutId="activeNav"
            initial={false}
            animate={{
              boxShadow: [
                '0 0 10px rgba(59,130,246,0.5)',
                '0 0 20px rgba(139,92,246,0.6)',
                '0 0 10px rgba(59,130,246,0.5)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Hover Glow */}
        <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, transparent 70%)'
        }} />
      </Link>
    </motion.div>
  );
}

function StatsCard({ position, label, value, color, delay, isCurrency = false }: { position: [number, number, number], label: string, value: string, color: string, delay: number, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState('0');
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Parse the target value for counting animation
  const targetValue = isCurrency ? 0 : parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  
  useEffect(() => {
    let start: number | null = null;
    const duration = 2000; // 2 seconds
    
    const animateCount = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      // Ease out function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easedProgress * targetValue);
      
      setDisplayValue(isCurrency ? '₹0.0 Cr' : currentValue.toString());
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [targetValue, delay, isCurrency]);
  
  return (
    <Html position={position} transform distanceFactor={10}>
      <motion.div 
        ref={cardRef}
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay, 
          duration: 0.8,
          ease: [0.23, 1, 0.32, 1]
        }}
        whileHover={{ 
          scale: 1.05,
          y: -5,
          transition: { duration: 0.3 }
        }}
        className="w-48 rounded-2xl bg-gray-900/70 border border-white/20 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] select-none transform transition-all duration-300 hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)]"
        style={{
          background: 'linear-gradient(145deg, rgba(17,24,39,0.7), rgba(31,41,55,0.7))',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.2) 0%, transparent 70%)'
        }} />
        
        <div className="relative z-10">
          <div className="text-xs text-white/60 uppercase tracking-wider font-medium mb-2 letter-spacing-1">
            {label}
          </div>
          <motion.div 
            className={`text-3xl font-bold ${color} drop-shadow-lg`}
            animate={isCurrency ? {} : {
              textShadow: [
                `0 0 10px currentColor`,
                `0 0 20px currentColor`,
                `0 0 10px currentColor`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {displayValue}{!isCurrency && '+'}
          </motion.div>
        </div>
      </motion.div>
    </Html>
  );
}

// Stat Box Component for Dashboard Cards
function StatBox({ label, value, color, delay, isCurrency = false, isStatic = false }: { 
  label: string; 
  value: string; 
  color: string; 
  delay: number; 
  isCurrency?: boolean;
  isStatic?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(isStatic ? value : '0');
  
  useEffect(() => {
    if (isStatic) return;
    
    let start: number | null = null;
    const duration = 1500; // 1.5 seconds
    const targetValue = isCurrency ? 0 : parseInt(value, 10) || 0;
    
    const animateCount = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easedProgress * targetValue);
      
      setDisplayValue(isCurrency ? '₹0.0 Cr' : currentValue.toString());
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, delay, isCurrency, isStatic]);
  
  return (
    <motion.div 
      className="rounded-xl bg-gray-900/50 border border-white/10 p-4 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 0 15px rgba(59,130,246,0.1)'
      }}
    >
      <div className="text-sm text-white/70 mb-2">{label}</div>
      <motion.div 
        className={`text-xl font-semibold ${color}`}
        animate={!isStatic && !isCurrency ? {
          textShadow: [
            `0 0 8px currentColor`,
            `0 0 15px currentColor`,
            `0 0 8px currentColor`
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {displayValue}{!isStatic && !isCurrency ? '+' : ''}
      </motion.div>
    </motion.div>
  );
}

// 3D Interactive Card Component
function StepCard({ 
  step, 
  title, 
  description, 
  icon, 
  index,
  isActive,
  onClick 
}: { 
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, rotateX: -15 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: { 
          duration: 0.8, 
          delay: index * 0.1,
          ease: [0.23, 1, 0.32, 1]
        }
      }}
      viewport={{ once: true, margin: "-100px" }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`
        relative cursor-pointer group
        rounded-2xl p-6 border backdrop-blur-xl
        transition-all duration-700 ease-out
        ${isActive 
          ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-purple-500/15 shadow-[0_0_40px_rgba(34,211,238,0.25)]' 
          : 'border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-800/80 hover:border-white/20'
        }
      `}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * 8}deg) rotateY(${mousePosition.x * 8}deg) translateZ(${isActive ? '20px' : '0px'})`,
        boxShadow: isActive 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
    >
      {/* Glow Effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
        ${isActive ? 'opacity-30' : ''}
      `} style={{
        background: 'radial-gradient(circle at center, rgba(34,211,238,0.4) 0%, transparent 70%)'
      }} />
      
      {/* Step Number with Glow */}
      <motion.div 
        className={`
          relative mb-4 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
          ${isActive 
            ? 'text-cyan-300 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
            : 'text-white/60 bg-white/5'
          }
        `}
        animate={isActive ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 0px rgba(34,211,238,0)',
            '0 0 20px rgba(34,211,238,0.6)',
            '0 0 0px rgba(34,211,238,0)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {step}
      </motion.div>
      
      {/* 3D Icon Container */}
      <div className="mb-5 relative">
        <motion.div 
          className="relative"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.2
          }}
        >
          <div className="relative z-10">
            {icon}
          </div>
          {/* 3D Shadow/Glow Effect */}
          <div className="absolute inset-0 blur-xl opacity-50">
            {icon}
          </div>
        </motion.div>
      </div>
      
      {/* Content */}
      <h3 className={`text-xl font-semibold mb-3 ${isActive ? 'text-white' : 'text-white/90'}`}>
        {title}
      </h3>
      <p className="text-white/70 text-sm leading-relaxed">
        {description}
      </p>
      
      {/* Floating Particles Effect */}
      {isActive && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

function City() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  
  useFrame((state) => {
    if (group.current) {
      // Smooth camera pan/rotation
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.current.x * 0.1 + state.clock.elapsedTime * 0.05, 0.02);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.current.y * 0.05, 0.02);
    }
  });

  return (
    <group
      ref={group}
      onPointerMove={(e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        pointer.current = { x, y };
      }}
    >
      {[...Array(24)].map((_, i) => {
        const x = -8 + (i % 6) * 2.5;
        const z = -6 + Math.floor(i / 6) * 2.5;
        const h = 1.5 + ((i * 31) % 5) * 0.8;
        const palette = ["#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"]; 
        const color = palette[i % palette.length];
        return <NeonBuilding key={i} position={[x, h / 2, z]} height={h} color={color} />;
      })}
      
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <ScreenPanel position={[0, 2.5, 0]} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <ScreenPanel position={[3.5, 3.0, -1.5]} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
        <ScreenPanel position={[-3.5, 2.2, -2.5]} />
      </Float>

      {/* Floating Holographic Stats Cards - MVP Metrics */}
      <StatsCard position={[-3.5, 3.2, 2]} label="ACTIVE SCREENS" value="70" color="text-cyan-400" delay={0.5} />
      <StatsCard position={[3.5, 2.8, 2]} label="CAMPAIGNS" value="50" color="text-purple-400" delay={0.7} />
      <StatsCard position={[0, 4.2, -2.5]} label="REVENUE" value="₹0.0 Cr" color="text-emerald-400" delay={0.9} isCurrency={true} />

      <ambientLight intensity={0.4} />
      <directionalLight intensity={1.5} position={[10, 10, 5]} color="#22d3ee" />
      <directionalLight intensity={1.0} position={[-10, 8, -5]} color="#a855f7" />
      <pointLight intensity={2} position={[0, 5, 0]} color="#ffffff" distance={10} decay={2} />
    </group>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="bg-gray-950 text-white">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'backdrop-blur-xl bg-black/40 border-b border-white/20' : 'backdrop-blur-md bg-black/20'}`}
        ref={headerRef}
      >
        <div className="mx-auto max-w-7xl h-16 px-6 flex items-center justify-between">
          {/* Logo and Brand */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] relative"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 30px rgba(59,130,246,0.6)'
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59,130,246,0.4)',
                  '0 0 30px rgba(139,92,246,0.5)',
                  '0 0 20px rgba(59,130,246,0.4)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* 3D Depth Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 blur-sm transform translate-y-1 opacity-50" />
              <svg xmlns="http://www.w3.org/2000/svg" className="relative h-6 w-6 text-white z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.div>
            <motion.span 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ lineHeight: '1.3' }}
            >
              Make My Marketing
            </motion.span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: 'Home', href: '/', exact: true },
              { name: 'How It Works', href: '/how-it-works' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Contact', href: '/contact' }
            ].map((item, i) => (
              <NavLink 
                key={item.name}
                href={item.href}
                exact={item.exact}
                delay={0.4 + i * 0.1}
              >
                {item.name}
              </NavLink>
            ))}
            
            <div className="flex items-center gap-3 ml-6">
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                style={{ lineHeight: '1.4' }}
              >
                Login
              </Link>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link 
                  href="/signup" 
                  className="relative px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 block"
                  style={{ lineHeight: '1.4' }}
                >
                  {/* 3D Button Depth */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transform translate-y-1 blur-sm opacity-50" />
                  
                  {/* Glass Highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Pulse Animation */}
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </motion.div>
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden text-white p-2"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>
        
        {/* Mobile Menu */}
        <motion.div 
          className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10"
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 py-4 space-y-3">
            {[
              { name: 'Home', href: '/' },
              { name: 'How It Works', href: '/how-it-works' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Contact', href: '/contact' }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all px-3"
                onClick={() => setIsMenuOpen(false)}
                style={{ lineHeight: '1.4' }}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <Link 
                href="/login" 
                className="block py-3 text-white/80 hover:text-white transition-colors px-3"
                onClick={() => setIsMenuOpen(false)}
                style={{ lineHeight: '1.4' }}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="block py-3 px-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
                style={{ lineHeight: '1.4' }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      </header>

      <section className="relative pt-24 min-h-[90vh] flex items-center" style={{
        paddingTop: isScrolled ? '4.5rem' : '6rem',
        transition: 'padding-top 0.3s ease'
      }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(168,139,250,0.12),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="relative z-10 max-w-xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Turn Digital Screens into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Profitable Ad Spaces</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-6 text-lg text-white/70 leading-relaxed">
              Manage bookings, campaigns, and payments seamlessly on Bengaluru’s leading DOOH platform.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-10 flex flex-wrap gap-4">
              <Link href="/dashboard/advertiser" className="px-8 py-4 rounded-lg bg-cyan-600 text-white font-semibold shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:shadow-[0_0_30px_rgba(8,145,178,0.7)] hover:bg-cyan-500 transition-all">Run Your Ads</Link>
              <Link href="/dashboard/owner" className="px-8 py-4 rounded-lg bg-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] hover:bg-purple-500 transition-all">Monetize Your Screens</Link>
            </motion.div>
          </div>
          <div className="relative h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <Canvas camera={{ position: [8, 6, 10], fov: 40 }}>
              <City />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
            </Canvas>
          </div>
        </div>
      </section>

      {/* How It Works Section - Premium 3D Version */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_60%),radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06),_transparent_70%),radial-gradient(ellipse_at_bottom,_rgba(88,28,135,0.08),_transparent_60%)]" />
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-4"
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="text-xl text-white/70 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Four simple steps to launch your DOOH campaign in Bengaluru
            </motion.p>
          </motion.div>
          
          {/* Steps Container */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30" />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
            
            {/* Step Cards */}
            <div className="relative grid gap-6 lg:grid-cols-4 z-10">
              <StepCard
                step={1}
                title="Discover Screens"
                description="Browse verified digital screens across Bengaluru using map and smart filters."
                icon={
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                }
                index={0}
                isActive={true}
                onClick={() => {}}
              />
              
              <StepCard
                step={2}
                title="Schedule Your Campaign"
                description="Select dates, time slots, ad duration, and frequency in real time."
                icon={
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-cyan-400 animate-pulse"></div>
                  </div>
                }
                index={1}
                isActive={false}
                onClick={() => {}}
              />
              
              <StepCard
                step={3}
                title="Upload Your Creative"
                description="Upload images or videos and preview them instantly on selected screens."
                icon={
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="absolute top-0 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-bounce"></div>
                  </div>
                }
                index={2}
                isActive={false}
                onClick={() => {}}
              />
              
              <StepCard
                step={4}
                title="Track & Verify Delivery"
                description="Monitor proof-of-play logs and campaign performance transparently."
                icon={
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
                  </div>
                }
                index={3}
                isActive={false}
                onClick={() => {}}
              />
            </div>
          </div>
          
          {/* CTA Button */}
          <motion.div 
            className="text-center mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            <Link 
              href="/dashboard/advertiser" 
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Campaign Today
            </Link>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-60" />
        <div className="absolute bottom-1/3 right-10 w-3 h-3 rounded-full bg-purple-500 animate-pulse opacity-40" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-blue-400 animate-ping opacity-50" />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-10">
        <div className="rounded-2xl border border-white/10 p-8 bg-gray-900">
          <h3 className="text-2xl font-semibold">For Screen Owners</h3>
          <p className="mt-3 text-white/70">Automated bookings, transparent payouts, and utilization insights.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
                          { label: "Upcoming Bookings", value: "50", color: "text-cyan-400" },
                          { label: "Monthly Revenue", value: "₹0.0 Cr", color: "text-emerald-400", isCurrency: true },
                          { label: "Screen Utilization", value: "0%", color: "text-purple-400" }
                        ].map((stat, i) => (
              <StatBox key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-gray-900">
          <h3 className="text-2xl font-semibold">For Advertisers</h3>
          <p className="mt-3 text-white/70">Real-time scheduling, transparent delivery, and analytics.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
                          { label: "Campaigns Active", value: "50", color: "text-purple-400" },
                          { label: "Screens Live", value: "70", color: "text-cyan-400" },
                          { label: "Cities Ready", value: "Bengaluru", color: "text-blue-400", isStatic: true }
                        ].map((stat, i) => (
              <StatBox key={stat.label} {...stat} delay={0.3 + i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Trust Section - Immersive 3D */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Environment */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.1),_transparent_70%)]" />
        
        {/* Floating Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(1000px) rotateX(60deg)'
          }} />
        </div>
        
        {/* Floating Particles */}
        <FloatingParticles />
        
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Technology & Trust
            </motion.h2>
            <motion.p 
              className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Enterprise-grade security, reliable cloud infrastructure,<br />
              verified ad delivery, and real-time analytics.
            </motion.p>
          </motion.div>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Secure Payments", "Cloud Hosting", "Proof-of-Play", "Analytics"].map((t, i) => (
            <FeatureCard 
              key={t}
              title={t}
              description={t === "Secure Payments" ? "Encrypted transactions with escrow-based payouts and automated invoicing." : t === "Cloud Hosting" ? "High-availability cloud infrastructure with auto-scaling and regular backups." : t === "Proof-of-Play" ? "Verified playback logs ensuring every ad runs exactly as scheduled." : "Real-time dashboards with campaign and performance insights."}
              icon={t === "Secure Payments" ? <LockIcon /> : t === "Cloud Hosting" ? <CloudIcon /> : t === "Proof-of-Play" ? <PlayIcon /> : <ChartIcon />}
              color={t === "Secure Payments" ? "from-blue-500 to-cyan-500" : t === "Cloud Hosting" ? "from-cyan-500 to-purple-500" : t === "Proof-of-Play" ? "from-purple-500 to-pink-500" : "from-pink-500 to-blue-500"}
              delay={i * 0.2}
            />
          ))}
        </div>
      </section>

      {/* Final CTA Section - Cinematic 3D Climax */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Dynamic Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        
        {/* Flowing Gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15),_transparent_70%)] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15),_transparent_70%)] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.1),_transparent_70%)] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        
        {/* 3D Background Elements */}
        <CTABackground />
        
        {/* Spotlight Lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative mx-auto max-w-7xl px-6 text-center z-10">
          {/* Cinematic Headline */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 1.2,
              ease: [0.23, 1, 0.32, 1]
            }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200 drop-shadow-2xl py-2 overflow-visible" style={{ lineHeight: '1.3' }}>
                Turn Every Screen into Revenue.
              </span>
              <span className="block mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 drop-shadow-2xl py-2 overflow-visible" style={{ lineHeight: '1.3' }}>
                Power Every Campaign with Impact.
              </span>
            </h1>
            
            {/* 3D Depth Effect */}
            <div className="relative mt-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />
              <p className="relative text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Join Bengaluru's leading DOOH platform and transform digital screens into profitable opportunities.
              </p>
            </div>
          </motion.div>
          
          {/* Cinematic CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Primary Button - Advertiser CTA */}
            <motion.div
              whileHover={{ 
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link 
                href="/advertiser/signup" 
                className="relative px-8 py-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg shadow-2xl overflow-visible group block"
                style={{ lineHeight: '1.5' }}
              >
                {/* 3D Cylinder Depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 to-cyan-700 transform translate-y-1 blur-sm opacity-50" />
                
                {/* Glow Border */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                
                {/* Glass Highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Pulse Animation */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center gap-3 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="py-1">Start Advertising Now</span>
                </span>
              </Link>
            </motion.div>
            
            {/* Secondary Button - Owner CTA */}
            <motion.div
              whileHover={{ 
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link 
                href="/owner/signup" 
                className="relative px-8 py-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-2xl overflow-visible group block"
                style={{ lineHeight: '1.5' }}
              >
                {/* 3D Cylinder Depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 transform translate-y-1 blur-sm opacity-50" />
                
                {/* Glow Border */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                
                {/* Glass Highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Active State Glow */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-40"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(147,51,234,0)',
                      '0 0 30px rgba(147,51,234,0.6)',
                      '0 0 20px rgba(147,51,234,0)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center gap-3 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="py-1">Partner as Screen Owner</span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Social Proof */}
          <motion.div 
            className="mt-16 flex flex-wrap justify-center gap-8 text-white/60"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            {[
              { label: "SCREENS LIVE", value: "70+" },
              { label: "CAMPAIGNS RUN", value: "50+" },
              { label: "CITIES", value: "Bengaluru" }
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Sweeping Light Ray */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"
          animate={{
            y: ['-100%', '100vh'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
      </section>

      {/* Premium SaaS Footer */}
      <footer className="relative border-t border-white/10 bg-gradient-to-t from-gray-950 to-gray-900 overflow-hidden">
        {/* 3D Background Layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.05),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.05),_transparent_60%)]" />
        </div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        
        {/* Animated Divider Line */}
        <motion.div 
          className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Left Side - Brand Identity */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
            >
              {/* 3D Logo with Depth */}
              <motion.div 
                className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
                animate={{
                  boxShadow: [
                    '0 8px 32px rgba(59,130,246,0.3)',
                    '0 12px 40px rgba(139,92,246,0.4)',
                    '0 8px 32px rgba(59,130,246,0.3)'
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* 3D Depth Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 blur-sm transform translate-x-1 translate-y-1" />
                
                <svg xmlns="http://www.w3.org/2000/svg" className="relative h-6 w-6 text-white z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  Make My Marketing
                </h3>
                <p className="text-white/60 text-sm mt-1 hidden sm:block">
                  Powering digital advertising across modern screens.
                </p>
              </div>
            </motion.div>
            
            {/* Right Side - Navigation Links */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Support', href: '/support' }
              ].map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="relative text-white/70 hover:text-white transition-all duration-300 group block"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  whileHover={{ 
                    y: -3,
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 3D Text Effect */}
                  <span className="relative z-10 block">
                    {link.name}
                  </span>
                  
                  {/* Extrusion Effect */}
                  <span className="absolute top-0.5 left-0.5 text-white/20 block -z-10">
                    {link.name}
                  </span>
                  
                  {/* Animated Underline */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-500 ease-out" />
                  
                  {/* Glass Highlight */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{
                    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.1), transparent)',
                  }} />
                  
                  {/* Glow Effect */}
                  <span className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm" style={{
                    background: 'radial-gradient(circle at center, rgba(59,130,246,0.4) 0%, transparent 70%)'
                  }} />
                  
                  {/* Ripple Effect */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-50 transition-opacity duration-200" style={{
                    background: 'radial-gradient(circle at center, rgba(96,165,250,0.3) 0%, transparent 70%)'
                  }} />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Bottom Center - Copyright */}
          <motion.div 
            className="mt-12 pt-8 border-t border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-white/60 text-sm">
              © 2026 Make My Marketing. All rights reserved.
            </p>
            
            {/* Subtle Background Animation */}
            <div className="mt-6 flex justify-center gap-4 text-white/40 text-xs">
              <span>Bengaluru</span>
              <span>•</span>
              <span>India</span>
              <span>•</span>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        </div>
        
        {/* Subtle Floating Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400/20 animate-pulse" />
        <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-purple-400/20 animate-ping" />
      </footer>
    </div>
  );
}

