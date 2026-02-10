'use client';
import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Move FloatingShapes outside component to prevent recreation
const FloatingShapes = React.memo(function FloatingShapes() {
  const shapes = React.useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: 5 + (i * 47) % 90,
      top: 10 + (i * 23) % 80,
      duration: 8 + (i * 31) % 4,
      delay: (i * 17) % 5,
    }));
  }, []);

  return (
    <>
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute w-2 h-2 rounded-full bg-blue-400/30"
          style={{ left: `${shape.left}%`, top: `${shape.top}%` }}
          animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
          transition={{ duration: shape.duration, repeat: Infinity, delay: shape.delay }}
        />
      ))}
    </>
  );
});

// Move FormField outside component
interface FormFieldProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  passwordVisible?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: string;
  showError?: boolean;
  children?: React.ReactNode;
}

const FormField = React.memo(function FormField({ 
  label, 
  type = 'text', 
  name, 
  value, 
  passwordVisible = false,
  onChange, 
  onBlur,
  error,
  showError,
  children 
}: FormFieldProps) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type={type === 'password' && passwordVisible ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-4 py-4 bg-gray-800/30 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
            showError && error 
              ? 'border-red-400 focus:ring-red-500' 
              : 'border-white/20 focus:ring-blue-500'
          }`}
          placeholder={label}
        />
        <label 
          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
            value 
              ? '-top-2.5 text-xs text-blue-400 bg-gray-900 px-1' 
              : 'top-4 text-white/70'
          }`}
        >
          {label}
        </label>
        {children}
      </div>
      <div className="min-h-[24px] mt-1">
        {showError && error && (
          <p className="text-red-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

export default function Signup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    accountType: 'advertiser' as 'advertiser' | 'owner'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Password strength - derived value, not state
  const passwordStrength = useMemo(() => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    return strength;
  }, [formData.password]);

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    
    // Only include non-empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: '' }));
    
    try {
      // Call actual signup API
      console.log('Submitting signup...', { email: formData.email, name: formData.name, role: formData.accountType });
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.accountType,
        }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!data.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      // Success animation
      setShowSuccess(true);
      setTimeout(() => {
        // Redirect based on account type
        window.location.href = formData.accountType === 'advertiser' 
          ? '/dashboard/advertiser' 
          : '/dashboard/owner';
      }, 2000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white overflow-hidden flex items-center justify-center">
        <FloatingShapes />
        
        <motion.div 
          className="text-center z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 10,
              delay: 0.2 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
            Account Created Successfully!
          </h2>
          <p className="text-white/70 text-lg">
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white overflow-hidden">
      {/* Animated Background - pointer-events-none to allow clicks through */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.1),_transparent_70%)]" />
        <FloatingShapes />
      </div>
      
      {/* Back to Home - higher z-index and pointer-events-auto for clickability */}
      <div className="relative z-20 pt-8 px-6 pointer-events-auto">
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
      
      {/* Main Signup Card - highest z-index with pointer-events-auto */}
      <div className="relative z-30 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 pointer-events-auto">
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_30px_rgba(59,130,246,0.4)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-2">
              Create Your Account
            </h1>
            <p className="text-white/70">
              Start advertising or monetize your screens today
            </p>
          </motion.div>
          
          {/* Signup Card - ensure pointer events work */}
          <motion.div 
            className="bg-gray-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden pointer-events-auto"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800/20 to-gray-900/20 transform translate-y-2 blur-sm pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative space-y-6 pointer-events-auto">
              <FormField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                onBlur={() => handleBlur('name')}
                error={errors.name}
                showError={(touched.name || hasAttemptedSubmit) && !!errors.name}
              />
              
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                onBlur={() => handleBlur('email')}
                error={errors.email}
                showError={(touched.email || hasAttemptedSubmit) && !!errors.email}
              />
              
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onBlur={() => handleBlur('password')}
                error={errors.password}
                showError={(touched.password || hasAttemptedSubmit) && !!errors.password}
              >
                {/* Password visibility toggle */}
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
                  onClick={() => setPasswordVisible(v => !v)}
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
                
                {/* Simple password strength - no animation */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Password Strength</span>
                      <span className={passwordStrength < 50 ? 'text-red-400' : passwordStrength < 75 ? 'text-yellow-400' : 'text-green-400'}>
                        {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength < 50 ? 'bg-red-500' : 
                          passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </FormField>
              
              {/* Account Type Selection */}
              <div className="space-y-3">
                <label className="block text-white/80 font-medium">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'advertiser', label: 'Advertiser', icon: '📢' },
                    { value: 'owner', label: 'Screen Owner', icon: '📺' }
                  ].map((type) => (
                    <motion.label
                      key={type.value}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.accountType === type.value
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value={type.value}
                        checked={formData.accountType === type.value}
                        onChange={(e) => setFormData({...formData, accountType: e.target.value as any})}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium text-white">{type.label}</div>
                      </div>
                      
                      {/* Selected indicator */}
                      {formData.accountType === type.value && (
                        <motion.div
                          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-500"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                    </motion.label>
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* 3D Depth Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-purple-700 transform translate-y-1 blur-sm opacity-50" />
                
                {/* Glow Pulse Animation */}
                <motion.div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-30"
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
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
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}