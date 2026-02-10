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
                      content="+91 98765 43210" 
                      link="https://wa.me/919876543210"
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
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-cyan-300 text-sm">
                      💡 Pro Tip: Include your campaign ID or account email when contacting support for faster resolution.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'resources' && (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Getting Started Guide",
                  description: "Complete walkthrough for new advertisers and screen owners",
                  icon: "🚀",
                  link: "#"
                },
                {
                  title: "Campaign Best Practices",
                  description: "Tips for creating high-performing DOOH campaigns",
                  icon: "🎯",
                  link: "#"
                },
                {
                  title: "Technical Specifications",
                  description: "File requirements, formats, and creative guidelines",
                  icon: "📐",
                  link: "#"
                }
              ].map((resource, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{resource.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                  <p className="text-white/80 mb-4">{resource.description}</p>
                  <div className="text-cyan-400 font-medium group-hover:translate-x-1 transition-transform inline-block">
                    Learn More →
                  </div>
                </motion.div>
              ))}
            </div>
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