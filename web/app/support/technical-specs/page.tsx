'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TechnicalSpecsPage() {
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

  const specs = [
    {
      category: "Image Ads",
      icon: "🖼️",
      items: [
        { label: "Formats", value: "JPG, PNG" },
        { label: "Resolution", value: "1920 x 1080 px (Full HD)" },
        { label: "Aspect Ratio", value: "16:9" },
        { label: "Max File Size", value: "10 MB" },
        { label: "Color Mode", value: "RGB" }
      ]
    },
    {
      category: "Video Ads",
      icon: "🎬",
      items: [
        { label: "Formats", value: "MP4, MOV" },
        { label: "Resolution", value: "1920 x 1080 px (Full HD)" },
        { label: "Max Duration", value: "30 seconds" },
        { label: "Max File Size", value: "50 MB" },
        { label: "Codec", value: "H.264" }
      ]
    },
    {
      category: "Design Guidelines",
      icon: "🎨",
      items: [
        { label: "Safe Zone", value: "Keep text within 90% of frame" },
        { label: "Font Size", value: "Minimum 72pt for readability" },
        { label: "Contrast", value: "High contrast for outdoor visibility" },
        { label: "Branding", value: "Logo in corner, subtle but visible" },
        { label: "CTA", value: "Clear call-to-action with QR code" }
      ]
    }
  ];

  const screenTypes = [
    { type: "Billboards", size: "20ft x 10ft", location: "Highways, Major Roads", brightness: "5000+ nits" },
    { type: "Street Furniture", size: "6ft x 4ft", location: "Bus Stops, Sidewalks", brightness: "3000+ nits" },
    { type: "Retail Screens", size: "55\" - 75\"", location: "Malls, Stores", brightness: "2500+ nits" },
    { type: "Transit Displays", size: "46\" - 65\"", location: "Metro, Airports", brightness: "4000+ nits" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />

        {/* Holographic Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(1000px) rotateX(60deg)'
          }} />
        </div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
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
        className="absolute w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"
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
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-4xl">📐</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
            Technical Specifications
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Everything you need to know about file formats, creative guidelines, and screen specifications.
          </p>
        </motion.div>

        {/* Specs Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {specs.map((spec, index) => (
            <motion.div
              key={spec.category}
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-500 h-full">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <div className="relative z-10">
                  <motion.span
                    className="text-4xl mb-4 block"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {spec.icon}
                  </motion.span>

                  <h3 className="text-xl font-semibold text-white mb-4">{spec.category}</h3>

                  <ul className="space-y-3">
                    {spec.items.map((item) => (
                      <li key={item.label} className="flex justify-between items-start text-sm">
                        <span className="text-white/60">{item.label}:</span>
                        <span className="text-cyan-400 font-medium text-right max-w-[60%]">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Screen Types Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">🖥️</span>
            Screen Network Specifications
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Screen Type</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Size</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Brightness</th>
                </tr>
              </thead>
              <tbody>
                {screenTypes.map((screen, index) => (
                  <motion.tr
                    key={screen.type}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <td className="py-4 px-4 text-white font-medium">{screen.type}</td>
                    <td className="py-4 px-4 text-white/80">{screen.size}</td>
                    <td className="py-4 px-4 text-white/80">{screen.location}</td>
                    <td className="py-4 px-4 text-cyan-400">{screen.brightness}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Download CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60 mb-4">Need templates to get started?</p>
          <button className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            <span>Download Creative Templates</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
