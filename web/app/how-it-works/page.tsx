'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HowItWorks() {
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

  const steps = [
    {
      step: 1,
      title: "Discover Screens",
      description: "Browse verified digital screens across Bengaluru using map and smart filters.",
      icon: (
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
      )
    },
    {
      step: 2,
      title: "Schedule Your Campaign",
      description: "Select dates, time slots, ad duration, and frequency in real time.",
      icon: (
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-cyan-400 animate-pulse"></div>
        </div>
      )
    },
    {
      step: 3,
      title: "Upload Your Creative",
      description: "Upload images or videos and preview them instantly on selected screens.",
      icon: (
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="absolute top-0 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-bounce"></div>
        </div>
      )
    },
    {
      step: 4,
      title: "Track & Verify Delivery",
      description: "Monitor proof-of-play logs and campaign performance transparently.",
      icon: (
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_60%),radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06),_transparent_70%),radial-gradient(ellipse_at_bottom,_rgba(88,28,135,0.08),_transparent_60%)]" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 30px rgba(59,130,246,0.6)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
              Make My Marketing
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link href="/how-it-works" className="text-blue-400 font-medium">How It Works</Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-6">
            How It Works
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Four simple steps to launch your DOOH campaign in Bengaluru
          </p>
        </motion.div>
        
        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30" />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
          
          <div className="relative grid gap-6 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-6 backdrop-blur-md hover:border-white/20 transition-all duration-500"
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: [0.23, 1, 0.32, 1]
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.2)'
                }}
              >
                {/* Step Number */}
                <div className="relative mb-4 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-cyan-300 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="mb-5 flex justify-center">
                  <motion.div 
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    {step.icon}
                  </motion.div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Link 
            href="/advertiser/signup" 
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Your Campaign Today
          </Link>
        </motion.div>
      </main>
    </div>
  );
}