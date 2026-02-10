'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TermsOfService() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.1),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />
        
        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
      
      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x * 30,
          y: mousePosition.y * 30,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />
      
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
            <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-purple-400 font-medium">Terms of Service</Link>
            <Link href="/support" className="text-white/70 hover:text-white transition-colors">Support</Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-4">
            Terms of Service
          </h1>
          <p className="text-white/70 text-lg">
            Last updated: February 10, 2026
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="space-y-8">
            <Section title="Acceptance of Terms">
              <p className="text-white/80 leading-relaxed">
                By accessing or using Make My Marketing's DOOH advertising platform, 
                you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </Section>
            
            <Section title="Services Provided">
              <ul className="text-white/80 space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Digital out-of-home advertising placement and management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Real-time campaign monitoring and analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Payment processing and revenue sharing for screen owners</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Technical support and platform maintenance</span>
                </li>
              </ul>
            </Section>
            
            <Section title="User Responsibilities">
              <p className="text-white/80 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account. You agree to provide accurate 
                information and to comply with all applicable laws when using our services.
              </p>
            </Section>
            
            <Section title="Payment Terms">
              <p className="text-white/80 leading-relaxed">
                All payments for advertising services are processed securely through our platform. 
                Campaign funds are held in escrow until successful delivery is verified. 
                Screen owners receive payments according to our revenue sharing agreement.
              </p>
            </Section>
            
            <Section title="Intellectual Property">
              <p className="text-white/80 leading-relaxed">
                You retain all rights to your content uploaded to our platform. 
                By using our services, you grant us a license to display your content 
                for the purpose of delivering your advertising campaigns.
              </p>
            </Section>
            
            <Section title="Limitation of Liability">
              <p className="text-white/80 leading-relaxed">
                Our liability for any claims arising from the use of our platform 
                shall not exceed the amount paid by you for the specific service 
                that gave rise to the claim.
              </p>
            </Section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section 
      className="border-b border-white/10 pb-8 last:border-0 last:pb-0"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
      {children}
    </motion.section>
  );
}