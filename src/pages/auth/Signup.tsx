import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAppStore } from '@/src/lib/store';

import { supabase } from '@/src/lib/supabase';
import { GoogleIcon } from '@/src/components/ui/icons';
import { AuthLayout } from '@/src/components/layout/AuthLayout';

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
    <AuthLayout>
      <div className="space-y-[32px]">
        <h2 className="text-[28px] font-bold font-display text-[var(--color-text-inverse-primary)] mb-[32px] leading-tight">
          Create your SpendWise account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-[24px]">
          <div className="space-y-[24px]">
            <Input
              inverse
              label="Full Name"
              placeholder="Adeola Oriola"
              value={formData.name}
              error={errors.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              inverse
              label="Email Address"
              type="email"
              placeholder="adeola@spendwise.ng"
              value={formData.email}
              error={errors.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              inverse
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              inverse
              label="Monthly Budget"
              type="number"
              placeholder="e.g. 150000"
              value={formData.budget}
              error={errors.budget}
              isCurrency
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          {generalError && (
            <div className="p-[12px] bg-[rgba(225,29,72,0.1)] border border-[rgba(225,29,72,0.2)] rounded-[8px] text-[var(--color-danger)] text-[13px] text-center animate-in fade-in zoom-in-95">
              {generalError}
            </div>
          )}

          <Button type="submit" className="w-full mt-[32px]" isLoading={isLoading}>
            Sign up
          </Button>
        </form>

        <div className="relative py-[24px]">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border-tertiary)]"></div>
          </div>
          <div className="relative flex justify-center text-[12px] uppercase tracking-widest font-[500]">
            <span className="bg-white px-[8px] text-[var(--color-text-inverse-secondary)]">OR CONTINUE WITH</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-[12px] bg-white border-[var(--color-border-tertiary)] text-[var(--color-text-inverse-primary)] hover:bg-gray-50"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon size={20} />
          <span className="font-bold">Continue with Google</span>
        </Button>

        <p className="text-center text-[14px] text-[var(--color-text-inverse-secondary)] mt-[24px]">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-[var(--color-accent)] font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
