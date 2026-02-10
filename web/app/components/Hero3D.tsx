'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

interface MousePosition {
  x: number;
  y: number;
}

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth spring animation for mouse movement
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  // Throttled mouse handler for 60fps performance
  const handleMouseMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  // Mobile gyroscope support
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!containerRef.current) return;
      
      const x = (e.gamma || 0) / 45; // -45 to 45 degrees
      const y = (e.beta || 0) / 90;  // -90 to 90 degrees
      
      mouseX.set(Math.max(-0.5, Math.min(0.5, x)));
      mouseY.set(Math.max(-0.5, Math.min(0.5, y)));
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      return () => window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
  }, [mouseX, mouseY]);

  // Transform values for parallax layers - CLAMPED to prevent cards going off-screen
  const bgX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);
  
  const gradientX = useTransform(mouseX, [-0.5, 0.5], [15, -15]);
  const gradientY = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  
  const headlineX = useTransform(mouseX, [-0.5, 0.5], [8, -8]);
  const headlineY = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const headlineRotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
  const headlineRotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);
  
  const ctaX = useTransform(mouseX, [-0.5, 0.5], [10, -10]);
  const ctaY = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  
  // Card transforms - more restricted to stay in viewport
  const card1X = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  const card1Y = useTransform(mouseY, [-0.5, 0.5], [-15, 15]);
  const card1RotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const card1RotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  
  const card2X = useTransform(mouseX, [-0.5, 0.5], [10, -10]);
  const card2Y = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const card2RotateX = useTransform(mouseY, [-0.5, 0.5], [-4, 4]);
  const card2RotateY = useTransform(mouseX, [-0.5, 0.5], [4, -4]);
  
  const glowX = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full"
      style={{ 
        perspective: '1000px',
        overflow: 'visible',
      }}
      onPointerMove={handleMouseMove}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => {
        setIsHovering(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* 3D Container with preserved transform style */}
      <div 
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* Background Particles Layer - Slow movement - z-index: 1 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            x: bgX,
            y: bgY,
            translateZ: '-100px',
            zIndex: 1,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
              style={{
                left: `${5 + (i * 47) % 90}%`,
                top: `${10 + (i * 23) % 80}%`,
              }}
            />
          ))}
        </motion.div>

        {/* Gradient Overlays - Medium movement - z-index: 2 */}
        <motion.div
          className="absolute inset-0"
          style={{
            x: gradientX,
            y: gradientY,
            translateZ: '-50px',
            zIndex: 2,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.2),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(168,139,250,0.15),_transparent_60%)]" />
        </motion.div>

        {/* Main Content Container - z-index: 10 */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20" style={{ zIndex: 10 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            
            {/* Left Content with 3D Headline */}
            <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* Headline with subtle depth shift */}
              <motion.div
                className="relative"
                style={{
                  x: headlineX,
                  y: headlineY,
                  rotateX: headlineRotateX,
                  rotateY: headlineRotateY,
                  translateZ: '30px',
                }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                  <span className="block text-white mb-2">
                    Turn Every Screen
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                    into Revenue.
                  </span>
                </h1>
                
                <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300">
                    Power Every Campaign
                  </span>
                  <span className="block text-white">
                    with Impact.
                  </span>
                </h2>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="mt-8 text-lg md:text-xl text-white/70 max-w-xl leading-relaxed"
                style={{
                  x: useTransform(mouseX, [-0.5, 0.5], [5, -5]),
                  y: useTransform(mouseY, [-0.5, 0.5], [5, -5]),
                  translateZ: '20px',
                }}
              >
                Join Bengaluru&apos;s leading DOOH platform and transform digital screens into profitable opportunities.
              </motion.p>

              {/* CTA Buttons with tilt + lift */}
              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4"
                style={{
                  x: ctaX,
                  y: ctaY,
                  translateZ: '50px',
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -8,
                    rotateX: -5,
                    rotateY: 5,
                    z: 30,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Link 
                    href="/advertiser/signup"
                    className="relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg shadow-[0_10px_40px_rgba(59,130,246,0.4)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.6)] transition-all duration-300 block"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* 3D Button depth */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 to-cyan-700 transform translate-y-2 blur-sm opacity-50" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 hover:opacity-20 transition-opacity duration-300 blur-md" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start Advertising Now
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -8,
                    rotateX: -5,
                    rotateY: -5,
                    z: 30,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Link 
                    href="/owner/signup"
                    className="relative px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-[0_10px_40px_rgba(147,51,234,0.4)] hover:shadow-[0_20px_60px_rgba(147,51,234,0.6)] transition-all duration-300 block"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* 3D Button depth */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 transform translate-y-2 blur-sm opacity-50" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 hover:opacity-20 transition-opacity duration-300 blur-md" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Partner as Screen Owner
                    </span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats section - NO parallax, stable positioning */}
              <div className="mt-12 flex gap-8 relative z-20">
                {[
                  { value: '70+', label: 'SCREENS LIVE' },
                  { value: '50+', label: 'CAMPAIGNS RUN' },
                  { value: 'Bengaluru', label: 'CITIES' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ y: -5, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side - 3D Canvas placeholder or visual element - z-index: 20 */}
            <div className="hidden lg:block relative h-[500px]" style={{ zIndex: 20 }}>
              {/* Decorative 3D floating cards - with constrained transforms */}
              <motion.div
                className="absolute top-10 right-10 w-64 h-40 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
                style={{
                  x: card1X,
                  y: card1Y,
                  rotateX: card1RotateX,
                  rotateY: card1RotateY,
                  translateZ: '40px',
                  zIndex: 30,
                  willChange: 'transform',
                }}
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className="text-cyan-400 text-3xl font-bold">70+</div>
                <div className="text-white/80 text-sm mt-1">Digital Screens</div>
              </motion.div>

              <motion.div
                className="absolute bottom-20 left-10 w-56 h-36 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
                style={{
                  x: card2X,
                  y: card2Y,
                  rotateX: card2RotateX,
                  rotateY: card2RotateY,
                  translateZ: '30px',
                  zIndex: 25,
                  willChange: 'transform',
                }}
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                }}
              >
                <div className="text-purple-400 text-3xl font-bold">50+</div>
                <div className="text-white/80 text-sm mt-1">Active Campaigns</div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl pointer-events-none"
                style={{
                  x: glowX,
                  y: glowY,
                  zIndex: 15,
                  willChange: 'transform',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Debug overlay - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 text-xs text-white/40 font-mono">
          X: {mousePosition.x.toFixed(3)} Y: {mousePosition.y.toFixed(3)}
        </div>
      )}
    </div>
  );
}
