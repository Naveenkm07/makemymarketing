'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Contact() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
    console.log('Contact form submitted:', formData);
    // Handle contact form submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.1),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_70%)]" />
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
            <Link href="/how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="text-blue-400 font-medium">Contact</Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-6">
            Get In Touch
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Have questions about our DOOH platform? We're here to help you succeed with your advertising goals.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            
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
                <label htmlFor="subject" className="block text-white/80 mb-2 font-medium">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="What's this regarding?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white/80 mb-2 font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>
              
              <motion.button
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
          
          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <ContactInfo 
                  icon="📧"
                  title="Email"
                  content="hello@makemymarketing.in"
                  link="mailto:hello@makemymarketing.in"
                />
                
                <ContactInfo 
                  icon="📱"
                  title="Phone"
                  content="+91 98765 43210"
                  link="tel:+919876543210"
                />
                
                <ContactInfo 
                  icon="📍"
                  title="Office"
                  content="Bengaluru, Karnataka, India"
                />
                
                <ContactInfo 
                  icon="🕒"
                  title="Business Hours"
                  content="Monday - Friday: 9AM - 6PM IST"
                />
              </div>
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Quick Support</h3>
              
              <div className="space-y-4">
                <SupportOption 
                  icon="❓"
                  title="FAQ"
                  description="Find answers to common questions"
                  link="/support"
                />
                
                <SupportOption 
                  icon="💬"
                  title="Live Chat"
                  description="Chat with our support team"
                  link="#"
                />
                
                <SupportOption 
                  icon="📚"
                  title="Documentation"
                  description="Platform guides and tutorials"
                  link="#"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function ContactInfo({ icon, title, content, link }: { 
  icon: string; 
  title: string; 
  content: string;
  link?: string;
}) {
  const contentElement = link ? (
    <a 
      href={link} 
      className="text-purple-400 hover:text-purple-300 transition-colors"
      target={link.startsWith('http') ? "_blank" : undefined}
      rel={link.startsWith('http') ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  ) : (
    <span className="text-white/80">{content}</span>
  );

  return (
    <div className="flex items-start gap-4">
      <span className="text-2xl mt-1">{icon}</span>
      <div>
        <div className="font-medium text-white">{title}</div>
        {contentElement}
      </div>
    </div>
  );
}

function SupportOption({ icon, title, description, link }: { 
  icon: string; 
  title: string; 
  description: string;
  link: string;
}) {
  return (
    <Link 
      href={link}
      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group"
    >
      <span className="text-2xl mt-1 group-hover:scale-110 transition-transform">{icon}</span>
      <div>
        <div className="font-medium text-white group-hover:text-purple-300 transition-colors">{title}</div>
        <div className="text-white/70 text-sm">{description}</div>
      </div>
    </Link>
  );
}