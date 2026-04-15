import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAppStore } from '@/src/lib/store';

import { supabase } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { GoogleIcon } from '@/src/components/ui/icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          // Fallback if profile doesn't exist yet
          setUser({
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            monthly_budget: 150000,
          });
        } else {
          setUser({
            id: profile.id,
            name: profile.full_name,
            email: data.user.email || '',
            monthly_budget: profile.monthly_budget,
          });
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Invalid email or password.');
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
      setGeneralError(err.message || 'Failed to login with Google.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full p-6 justify-center space-y-8"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-[32px] font-black text-accent">Welcome Back.</h1>
        <p className="text-text-secondary">Log in to track your naira.</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="adeola@spendwise.ng"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
            />
          </div>

          {generalError && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-radius-md text-danger text-[13px] text-center animate-in fade-in zoom-in-95">
              {generalError}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Log In
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
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-accent font-bold">
          Sign up free
        </Link>
      </p>
    </motion.div>
  );
}
