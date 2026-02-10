'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Pricing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedPlan, setSelectedPlan] = useState('pro');
  
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

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '₹4,999',
      period: 'per month',
      popular: false,
      features: [
        'Up to 5 campaigns',
        'Basic analytics',
        'Email support',
        'Standard screens only'
      ],
      cta: 'Get Started'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '₹14,999',
      period: 'per month',
      popular: true,
      features: [
        'Unlimited campaigns',
        'Advanced analytics',
        'Priority support',
        'Premium + Standard screens',
        'Custom scheduling',
        'A/B testing'
      ],
      cta: 'Choose Professional'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored solution',
      popular: false,
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solution',
        'API access',
        '24/7 premium support'
      ],
      cta: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.1),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.08),_transparent_70%)]" />
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
            <Link href="/pricing" className="text-blue-400 font-medium">Pricing</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
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
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your advertising needs. All plans include our core features with no hidden fees.
          </p>
        </motion.div>
        
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-2xl border backdrop-blur-xl p-8 transition-all duration-500 ${
                plan.popular 
                  ? 'border-blue-400/50 bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]' 
                  : 'border-white/10 bg-gray-900/50 hover:border-white/20'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{
                y: plan.popular ? -15 : -10,
                scale: plan.popular ? 1.03 : 1.02,
                boxShadow: plan.popular 
                  ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.3)' 
                  : '0 20px 40px -10px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.1)'
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/70 ml-2">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ Section */}
        <motion.div 
          className="mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Do you offer custom enterprise solutions?",
                answer: "Absolutely! Our enterprise plan can be fully customized to meet your specific business needs."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, UPI, and bank transfers for Indian businesses."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-white/70">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}