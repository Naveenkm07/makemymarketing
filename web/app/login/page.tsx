'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Memoized form field component - defined outside main component to prevent recreation
const FormField = memo(function FormField({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  onBlur,
  error,
  children,
  passwordVisible = false
}: { 
  label: string; 
  type?: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onBlur?: () => void;
  error?: string;
  children?: React.ReactNode;
  passwordVisible?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value.length > 0;

  return (
    <div className="relative">
      <div className="relative group">
        <input
          type={type === 'password' && passwordVisible ? 'text' : type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={`w-full px-4 py-4 bg-gray-800/30 border rounded-xl text-white placeholder-white/50 
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
            transition-all duration-300 backdrop-blur-sm
            ${error ? 'border-red-400 focus:ring-red-500' : 'border-white/20 hover:border-white/40'}`}
          placeholder={label}
          autoComplete={name === 'password' ? 'current-password' : 'email'}
        />
        <label 
          htmlFor={name}
          className={`absolute left-4 transition-all duration-300 pointer-events-none
            ${showLabel 
              ? '-top-2.5 text-xs text-purple-400 bg-gray-900/80 px-2 rounded' 
              : 'top-4 text-white/70'}`}
        >
          {label}
        </label>
        
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 
          opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />
        
        {children}
      </div>
      
      {error && (
        <p className="text-red-400 text-sm mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

// Background shapes with stable random positions - computed once
const FloatingShapes = memo(function FloatingShapes() {
  // Use useMemo to generate stable random positions once
  const shapes = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: 5 + (i * 47) % 90,
      top: 10 + (i * 23) % 80,
      duration: 6 + (i * 31) % 4,
      delay: (i * 17) % 4,
      size: 1 + (i % 3),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            width: `${shape.size * 0.5}rem`,
            height: `${shape.size * 0.5}rem`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0.2, 0.8, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

// Background layer - isolated from form interactions
const BackgroundLayer = memo(function BackgroundLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Static gradient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15),_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.1),_transparent_70%)]" />
      
      {/* Animated floating shapes */}
      <FloatingShapes />
      
      {/* Mouse-following glow effect - CSS-based for performance */}
      <MouseGlow />
    </div>
  );
});

// Mouse glow effect using CSS custom properties - no React state updates
const MouseGlow = memo(function MouseGlow() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="absolute w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none
        transition-transform duration-300 ease-out"
      style={{
        left: 'var(--mouse-x, 50%)',
        top: 'var(--mouse-y, 50%)',
        transform: 'translate(-50%, -50%)',
        willChange: 'left, top',
      }}
    />
  );
});

// Main login component
export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Stable handlers using useCallback
  const handleInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field on blur
    let error = '';
    if (field === 'email') {
      if (!formData.email.trim()) {
        error = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        error = 'Email is invalid';
      }
    } else if (field === 'password') {
      if (!formData.password) {
        error = 'Password is required';
      }
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [formData.email, formData.password]);

  const validateForm = useCallback(() => {
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
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to appropriate dashboard
      window.location.href = '/dashboard/advertiser';
    } catch (error) {
      setErrors({ submit: 'Invalid email or password' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isSubmitting]);

  // Toggle password visibility - stable handler
  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-cyan-950 text-white overflow-hidden">
      {/* Background layer - completely isolated */}
      <BackgroundLayer />
      
      {/* Back to Home */}
      <div className="relative z-10 pt-8 px-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group-hover:-translate-x-1 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Main Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="w-full max-w-md">
          {/* Platform Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
              bg-gradient-to-br from-purple-500 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,0.4)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200 mb-2">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Sign in to your Make My Marketing account
            </p>
          </motion.div>
          
          {/* Login Card - pointer-events-auto ensures form is interactive */}
          <motion.div 
            className="bg-gray-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl 
              relative overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ pointerEvents: 'auto' }}
          >
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800/20 to-gray-900/20 
              transform translate-y-2 blur-sm pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative space-y-6">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email ? errors.email : undefined}
              />
              
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password ? errors.password : undefined}
                passwordVisible={passwordVisible}
              >
                {/* Password visibility toggle */}
                <button
                  type="button"
                  className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </FormField>
              
              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                  <input type="checkbox" className="rounded bg-gray-700 border-gray-600 cursor-pointer" />
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
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 
                  text-white font-bold text-lg shadow-xl relative overflow-hidden group 
                  disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:-translate-y-0.5 
                  transition-all duration-200 active:scale-[0.98]"
                whileTap={{ scale: 0.98 }}
              >
                {/* 3D Depth Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-700 to-cyan-700 
                  transform translate-y-1 blur-sm opacity-50 pointer-events-none" />
                
                {/* Glow effect on submit */}
                {isSubmitting && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 
                    opacity-30 animate-pulse pointer-events-none" />
                )}
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V8c0-2.92 1.56-5.47 3.88-6.85A7.96 7.96 0 014 12H4z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </>
                  )}
                </span>
              </motion.button>
              
              {errors.submit && (
                <div className="text-red-400 text-center py-3 rounded-lg bg-red-500/10 border border-red-500/20
                  animate-in fade-in slide-in-from-top-1">
                  {errors.submit}
                </div>
              )}
            </form>
            
            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-white/60 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Create one here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}