'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Login() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to appropriate dashboard
      window.location.href = '/dashboard/advertiser'; // or '/dashboard/owner' based on user type
    } catch (error) {
      setErrors({ submit: 'Invalid email or password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FloatingShapes = () => (
    <>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-purple-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}
    </>
  );

  const FormField = ({ 
    label, 
    type = 'text', 
    name, 
    value, 
    onChange, 
    error,
    children 
  }: { 
    label: string; 
    type?: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    error?: string;
    children?: React.ReactNode;
  }) => (
    <div className="relative">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type={type === 'password' && passwordVisible ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-4 bg-gray-800/30 border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
            error ? 'border-red-400 focus:ring-red-500' : ''
          }`}
          placeholder={label}
        />
        <label 
          className={`absolute left-4 top-4 text-white/70 transition-all duration-300 pointer-events-none ${
            value ? '-top-2.5 text-xs text-purple-400' : ''
          }`}
        >
          {label}
        </label>
        
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        
        {children}
      </motion.div>
      
      {error && (
        <motion.p 
          className="text-red-400 text-sm mt-2 flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-cyan-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.1),_transparent_70%)]" />
        <FloatingShapes />
      </div>
      
      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 50,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />
      
      {/* Back to Home */}
      <div className="relative z-10 pt-8 px-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <motion.div
            whileHover={{ x: -3 }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </motion.div>
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Main Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Platform Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,0.4)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200 mb-2">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Sign in to your Make My Marketing account
            </p>
          </motion.div>
          
          {/* Login Card */}
          <motion.div 
            className="bg-gray-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800/20 to-gray-900/20 transform translate-y-2 blur-sm" />
            
            <form onSubmit={handleSubmit} className="relative space-y-6">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                error={errors.email}
              />
              
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                error={errors.password}
              >
                {/* Password visibility toggle */}
                <button
                  type="button"
                  className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </FormField>
              
              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/70">
                  <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              
              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* 3D Depth Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-700 to-cyan-700 transform translate-y-1 blur-sm opacity-50" />
                
                {/* Glow Pulse Animation */}
                <motion.div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-30"
                  animate={isSubmitting ? {
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isSubmitting ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </>
                  )}
                </span>
              </motion.button>
              
              {errors.submit && (
                <motion.div 
                  className="text-red-400 text-center py-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.submit}
                </motion.div>
              )}
            </form>
            
            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-white/60 text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Create one here
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}