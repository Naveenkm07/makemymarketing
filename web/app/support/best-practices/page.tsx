'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BestPracticesPage() {
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

  const practices = [
    {
      title: "Know Your Audience",
      description: "Research the demographics around each screen location. Tailor your message to the local audience for maximum impact.",
      icon: "🎯",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Keep It Simple",
      description: "Use clear, concise messaging. Viewers have 5-10 seconds to absorb your content. One key message per creative works best.",
      icon: "✨",
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "High Contrast Design",
      description: "Ensure your creative stands out in various lighting conditions. Use bold colors, large fonts, and minimal text.",
      icon: "🎨",
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Strategic Timing",
      description: "Schedule campaigns during peak traffic hours. Morning and evening commutes typically deliver the highest impressions.",
      icon: "⏰",
      color: "from-pink-500 to-cyan-500"
    },
    {
      title: "A/B Testing",
      description: "Run multiple creative variants to identify what resonates best. Test different headlines, images, and calls-to-action.",
      icon: "🧪",
      color: "from-purple-500 to-blue-500"
    },
    {
      title: "Track & Optimize",
      description: "Monitor campaign performance daily. Use proof-of-play data to optimize placements, timing, and creative elements.",
      icon: "📈",
      color: "from-cyan-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />

        {/* Holographic Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(1000px) rotateX(60deg)'
          }} />
        </div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 50,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.6)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Make My Marketing
            </span>
          </Link>

          <Link
            href="/support"
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Support
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-4xl">🎯</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4">
            Campaign Best Practices
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Expert tips and proven strategies to maximize your DOOH campaign performance and ROI.
          </p>
        </motion.div>

        {/* Practices Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice, index) => (
            <motion.div
              key={practice.title}
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-500 h-full">
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${practice.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />

                <div className="relative z-10">
                  <motion.span
                    className="text-4xl mb-4 block"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {practice.icon}
                  </motion.span>

                  <h3 className="text-lg font-semibold text-white mb-3">{practice.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{practice.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 text-center"
        >
          {[
            { value: "3x", label: "Higher engagement with video content" },
            { value: "40%", label: "Lift in brand recall with DOOH" },
            { value: "70+", label: "Screens available across Bengaluru" }
          ].map((stat, index) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
