'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Support() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('faq');
  
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

  const faqs = [
    {
      question: "How do I create an advertising campaign?",
      answer: "Sign up for an account, browse available screens, select your preferred locations and time slots, upload your creative assets, and launch your campaign with secure payment processing."
    },
    {
      question: "What file formats are supported for ads?",
      answer: "We support JPG, PNG, GIF, and MP4 formats. Video ads should be under 30 seconds. Recommended dimensions are 1920x1080 pixels for optimal display quality."
    },
    {
      question: "How is campaign performance tracked?",
      answer: "Our proof-of-play system provides real-time analytics including impressions, reach, engagement metrics, and detailed playback logs for every screen in your campaign."
    },
    {
      question: "What is the minimum campaign duration?",
      answer: "Campaigns can run for as little as 1 day or as long as you need. Longer campaigns typically offer better pricing and audience reach."
    },
    {
      question: "How do screen owners get paid?",
      answer: "Screen owners receive payments bi-weekly via bank transfer. Revenue is calculated based on actual plays delivered and verified through our proof-of-play system."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.1),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.08),_transparent_70%)]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 7 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      
      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"
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
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/support" className="text-cyan-400 font-medium">Support</Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
            Support Center
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Get help with your DOOH campaigns, technical issues, or account questions. 
            We're here to support your advertising success.
          </p>
        </motion.div>
        
        {/* Tab Navigation */}
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex gap-2">
            {[
              { id: 'faq', label: 'FAQ', icon: '❓' },
              { id: 'contact', label: 'Contact Us', icon: '✉️' },
              { id: 'resources', label: 'Resources', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'faq' && (
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          )}
          
          {activeTab === 'contact' && (
            <motion.div 
              className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Get in Touch</h3>
                  <div className="space-y-4">
                    <ContactItem 
                      icon="📧" 
                      title="Email Support" 
                      content="support@makemymarketing.in" 
                      link="mailto:support@makemymarketing.in"
                    />
                    <ContactItem 
                      icon="📱" 
                      title="WhatsApp" 
                      content="+91 9611185435" 
                      link="https://wa.me/919611185435"
                    />
                    <ContactItem 
                      icon="🕒" 
                      title="Business Hours" 
                      content="Monday - Friday: 9AM - 6PM IST"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Quick Response</h3>
                  <p className="text-white/80 mb-6">
                    Our support team typically responds within 2 hours during business hours. 
                    For urgent matters, use our WhatsApp support for immediate assistance.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        
        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Section Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
                Self-Service Resources
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Explore our comprehensive guides, best practices, and technical specifications to maximize your DOOH success.
              </p>
            </motion.div>

            {/* Resource Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Getting Started Guide",
                  description: "Complete walkthrough for new advertisers and screen owners.",
                  icon: "🚀",
                  link: "/support/getting-started",
                  color: "from-cyan-500 to-blue-500",
                  glowColor: "rgba(34,211,238,0.3)"
                },
                {
                  title: "Campaign Best Practices",
                  description: "Tips for creating high-performing DOOH campaigns.",
                  icon: "🎯",
                  link: "/support/best-practices",
                  color: "from-purple-500 to-pink-500",
                  glowColor: "rgba(168,85,247,0.3)"
                },
                {
                  title: "Technical Specifications",
                  description: "File formats, sizes, and creative guidelines.",
                  icon: "📐",
                  link: "/support/technical-specs",
                  color: "from-blue-500 to-cyan-500",
                  glowColor: "rgba(59,130,246,0.3)"
                }
              ].map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ y: -15, scale: 1.02 }}
                  className="relative group"
                >
                  <Link href={resource.link} className="block">
                    {/* Glow Effect */}
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at center, ${resource.glowColor} 0%, transparent 70%)` }}
                    />

                    {/* Card */}
                    <div className="relative bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-500 h-full overflow-hidden">
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                      {/* 3D Icon Container */}
                      <motion.div
                        className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-6 shadow-lg`}
                        animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                        whileHover={{ scale: 1.1, rotate: 0 }}
                      >
                        {/* Glow behind icon */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${resource.color} blur-lg opacity-50`} />
                        <span className="relative text-4xl z-10">{resource.icon}</span>
                      </motion.div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold text-white mb-3 relative z-10">
                        {resource.title}
                      </h3>
                      <p className="text-white/70 mb-6 relative z-10">
                        {resource.description}
                      </p>

                      {/* Learn More Button */}
                      <motion.div
                        className="inline-flex items-center gap-2 text-cyan-400 font-medium relative z-10"
                        whileHover={{ x: 5 }}
                      >
                        <span>Learn More</span>
                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </motion.svg>
                      </motion.div>

                      {/* Corner Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Additional Help CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 text-center"
            >
              <p className="text-white/60 mb-4">Cannot find what you are looking for?</p>
              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
              >
                <span>Contact Support</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </main>
  </div>
);
}

function ContactItem({ icon, title, content, link }: { 
  icon: string; 
  title: string; 
  content: string;
  link?: string;
}) {
  const contentElement = link ? (
    <a 
      href={link} 
      className="text-cyan-400 hover:text-cyan-300 transition-colors"
      target={link.startsWith('http') ? "_blank" : undefined}
      rel={link.startsWith('http') ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  ) : (
    <span className="text-white/80">{content}</span>
  );

  return (
    <div className="flex items-start gap-3">
      <span className="text-xl mt-1">{icon}</span>
      <div>
        <div className="font-medium text-white">{title}</div>
        {contentElement}
      </div>
    </div>
  );
}
