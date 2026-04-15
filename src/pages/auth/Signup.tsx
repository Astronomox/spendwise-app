import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAppStore } from '@/src/lib/store';

import { supabase } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { GoogleIcon } from '@/src/components/ui/icons';

export default function SignupPage() {
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    budget: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.budget) {
      newErrors.budget = 'Monthly budget is required';
    } else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid amount greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            monthly_budget: Number(formData.budget),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: formData.name,
              monthly_budget: Number(formData.budget),
            },
          ]);

        setUser({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          monthly_budget: Number(formData.budget),
        });
        
        navigate('/auth/onboarding');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to signup with Google.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full p-6 justify-center space-y-8 overflow-y-auto"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-[32px] font-black text-accent">Join SpendWise.</h1>
        <p className="text-text-secondary">Start building real wealth today.</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="Adeola Oriola"
            value={formData.name}
            error={errors.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="adeola@spendwise.ng"
            value={formData.email}
            error={errors.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={formData.password}
            error={errors.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Monthly Budget (NGN)"
            type="number"
            placeholder="e.g. 150000"
            value={formData.budget}
            error={errors.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />

          {generalError && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-radius-md text-danger text-[13px] text-center animate-in fade-in zoom-in-95">
              {generalError}
            </div>
          )}

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
            <span className="bg-white px-2 text-text-muted font-bold">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-3 h-12"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon size={20} />
          <span className="font-bold">Google</span>
        </Button>
      </div>

      <p className="text-center text-[14px] text-text-secondary">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-accent font-bold">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
