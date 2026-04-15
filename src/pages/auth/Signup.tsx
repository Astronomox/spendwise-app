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
      className="flex flex-col h-full bg-[var(--color-text-primary)] overflow-hidden"
    >
      {/* Top Section */}
      <div className="relative pt-[40px] pb-[32px] px-[24px] shrink-0 text-center">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[var(--color-accent)] rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <h1 className="text-[32px] font-black text-white font-display mb-[8px] relative z-10">SpendWise.</h1>
        <p className="text-[var(--color-text-muted)] text-[15px] relative z-10">Start building real wealth today.</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white rounded-t-[24px] p-[24px] pt-[32px] space-y-[24px] shadow-[var(--shadow-shadow-lg)] z-10 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-[16px]">
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
            <div className="p-[12px] bg-[rgba(225,29,72,0.1)] border border-[rgba(225,29,72,0.2)] rounded-[8px] text-[var(--color-danger)] text-[13px] text-center animate-in fade-in zoom-in-95">
              {generalError}
            </div>
          )}

          <Button type="submit" className="w-full mt-[8px]" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="relative py-[8px]">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
            <span className="bg-white px-[8px] text-[var(--color-text-muted)] font-bold">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-[12px]"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon size={20} />
          <span className="font-bold">Google</span>
        </Button>

        <p className="text-center text-[14px] text-[var(--color-text-secondary)] pt-[8px]">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-[var(--color-accent)] font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
