// src/pages/auth/Login.tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';

interface LoginFormErrors {
  email?:    string;
  password?: string;
  form?:     string;
}

interface Feature {
  title: string;
  body:  string;
}

const FEATURES: readonly Feature[] = [
  { title: 'Auto-log from SMS',  body: 'Capture bank alerts instantly — no manual entry needed.' },
  { title: 'Spend analytics',    body: 'Weekly and monthly breakdowns at a glance.'              },
  { title: 'Savings goals',      body: 'Set targets and track your progress every day.'          },
] as const;

export default function Login(): React.JSX.Element {
  const navigate = useNavigate();
  const setUser  = useAppStore((s) => s.setUser);

  const [email,    setEmail]    = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors,   setErrors]   = useState<LoginFormErrors>({});
  const [loading,  setLoading]  = useState<boolean>(false);

  const validate = (): boolean => {
    const e: LoginFormErrors = {};
    if (!email)                             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = 'Enter a valid email address';
    if (!password)                          e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)
        ?? 'https://spendwise-app-39vv.onrender.com';

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      // API returns flat shape: { id, email, fullName, token }
      const data = await res.json() as {
        id?:       string;
        email?:    string;
        fullName?: string;
        token?:    string;
        message?:  string;
      };

      if (!res.ok) {
        setErrors({ form: data.message ?? 'Invalid email or password' });
        return;
      }

      // Persist token for authenticated API requests
      localStorage.setItem('sw_token', data.token ?? '');

      // Save user to global store — sets isAuthenticated: true
      setUser({
        id:            data.id       ?? '',
        fullName:      data.fullName ?? '',
        email:         data.email    ?? '',
        monthlyBudget: 150_000,
      });

      navigate('/dashboard', { replace: true });
    } catch {
      setErrors({ form: 'Network error — please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">

      {/* ── Left hero panel (desktop) ─────────────────── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#0D0906]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(183,65,14,0.4) 0%, transparent 55%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(184,115,51,0.18) 0%, transparent 50%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-[28px] font-black font-display text-gradient-rust tracking-tight">
            SpendWise.
          </h1>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-[44px] font-extrabold font-display text-cream leading-[1.08] tracking-tight mb-4">
            Track every naira.<br />
            <span className="text-cream/40">Build real wealth.</span>
          </h2>
          <p className="text-[16px] text-cream/45 font-medium leading-relaxed max-w-sm">
            Effortless expense logging, smart insights, and goals that keep you honest.
          </p>
        </div>

        {/* Feature grid */}
        <div className="relative z-10 grid grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title}>
              <div className="w-7 h-7 rounded-lg bg-rust/20 border border-rust/30 flex items-center justify-center mb-3">
                <CheckCircle size={14} className="text-rust-light" />
              </div>
              <p className="text-[13px] font-bold text-cream/75 mb-1">{f.title}</p>
              <p className="text-[12px] text-cream/35 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FAF8F5]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <h1 className="text-[22px] font-black font-display text-gradient-rust">SpendWise.</h1>
          </div>

          <h2 className="text-[28px] font-extrabold font-display text-gray-900 tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-[14px] text-gray-500 font-medium mb-8">
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              inverse
              label="Email"
              type="email"
              placeholder="adeola@spendwise.ng"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
              error={errors.email}
            />
            <Input
              inverse
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
              error={errors.password}
            />

            {/* Form-level error */}
            {errors.form != null && (
              <p className="text-[13px] font-semibold text-red-500 text-center">
                {errors.form}
              </p>
            )}

            <Button
              type="submit"
              isLoading={loading}
              size="lg"
              className="w-full mt-2 rounded-2xl"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google SSO placeholder */}
          <Button
            type="button"
            variant="white"
            size="md"
            className="w-full border border-gray-200 shadow-sm gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-[14px] text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-rust font-bold hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}