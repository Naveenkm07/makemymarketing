'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OwnerSignup() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    screenCount: '1'
  });
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Owner signup:', formData);
    // Handle signup logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.1),_transparent_70%)]" />
        
        {/* Floating Particles */}
        {[...Array(35)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 7 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x * 40,
          y: mousePosition.y * 40,
        }}
        transition={{
          type: "spring",
          stiffness: 30,
          damping: 20,
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 30px rgba(139,92,246,0.6)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300 group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
              Make My Marketing
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/login" className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300 mb-4">
            Monetize Your Screens
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Join Bengaluru's leading DOOH platform and turn your digital screens 
            into profitable advertising spaces. Start earning passive income today.
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white/80 mb-2 font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-white/80 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-white/80 mb-2 font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="+91 98765 43210"
                required
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-white/80 mb-2 font-medium">
                Screen Location Address
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Enter the address where your screens are located"
                required
              />
            </div>
            
            <div>
              <label htmlFor="screenCount" className="block text-white/80 mb-2 font-medium">
                Number of Screens
              </label>
              <select
                id="screenCount"
                value={formData.screenCount}
                onChange={(e) => setFormData({...formData, screenCount: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="1">1 Screen</option>
                <option value="2-5">2-5 Screens</option>
                <option value="6-10">6-10 Screens</option>
                <option value="10+">10+ Screens</option>
              </select>
            </div>
            
            <motion.button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Register as Screen Owner
              </span>
            </motion.button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
        
        {/* Benefits Section */}
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { icon: '💰', title: 'Passive Income', desc: 'Earn monthly revenue from advertising' },
            { icon: '📊', title: 'Real Analytics', desc: 'Track performance and earnings in real-time' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Bi-weekly payments with transparent records' }
          ].map((benefit, i) => (
            <motion.div
              key={i}
              className="bg-gray-900/40 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center hover:border-purple-400/30 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-white/70 text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}