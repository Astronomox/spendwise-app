import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAppStore } from '@/src/lib/store';

import { auth } from '@/src/lib/api';
import { GoogleIcon } from '@/src/components/ui/icons';
import { AuthLayout } from '@/src/components/layout/AuthLayout';

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
      const response = await auth.login(email, password);

      // The backend returns the user object directly, not wrapped in a `user` property.
      // E.g. { token: '...', id: '...', email: '...', fullName: '...' }
      const { token, ...user } = response;

      // Save to localStorage
      localStorage.setItem('sw_token', token);
      localStorage.setItem('sw_user', JSON.stringify(user));

      // Update global store
      setUser(user);

      // Navigate to dashboard asynchronously to ensure state has settled
      setTimeout(() => navigate('/dashboard'), 0);

    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Google login not natively supported by the new custom backend instructions yet.
    setGeneralError('Google login is coming soon.');
  };

  return (
    <AuthLayout>
      <div className="space-y-[32px]">
        <h2 className="text-[28px] font-bold font-display text-[var(--color-text-inverse-primary)] mb-[32px]">
          Log in to SpendWise
        </h2>

        <form onSubmit={handleSubmit} className="space-y-[24px]">
          <div className="space-y-[24px]">
            <Input
              inverse
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
              inverse
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
            <div className="p-[12px] bg-[rgba(225,29,72,0.1)] border border-[rgba(225,29,72,0.2)] rounded-[8px] text-[var(--color-danger)] text-[13px] text-center animate-in fade-in zoom-in-95">
              {generalError}
            </div>
          )}

          <Button type="submit" className="w-full mt-[32px]" isLoading={isLoading}>
            Log In
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
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-[var(--color-accent)] font-bold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
