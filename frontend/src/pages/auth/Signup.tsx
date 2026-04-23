// src/pages/auth/Signup.tsx
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';
import { auth } from '@/lib/api';

interface SignupFormState {
  name:     string;
  email:    string;
  password: string;
}

interface SignupFormErrors {
  name?:     string;
  email?:    string;
  password?: string;
  form?:     string;
}

export default function Signup(): React.JSX.Element {
  const navigate = useNavigate();
  const setUser  = useAppStore((s) => s.setUser);

  const [form, setForm] = useState<SignupFormState>({
    name:     '',
    email:    '',
    password: '',
  });
  const [errors,  setErrors]  = useState<SignupFormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const setField =
    (key: keyof SignupFormState) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      setErrors(v => ({ ...v, [key]: undefined, form: undefined }));
    };

  const validate = (): boolean => {
    const e: SignupFormErrors = {};
    if (!form.name.trim())                          e.name     = 'Full name is required';
    if (!form.email)                                e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email    = 'Enter a valid email';
    if (!form.password)                             e.password = 'Password is required';
    else if (form.password.length < 6)             e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const data = await auth.signup(form.email, form.password, form.name);

      // Persist token
      localStorage.setItem('sw_token', data.token);

      // Save user to global store
      setUser({
        id:            data.id,
        fullName:      data.fullName,
        email:         data.email,
        monthlyBudget: 0,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-10">
          <h1 className="text-[22px] font-black font-display text-gradient-rust">SpendWise.</h1>
        </div>

        <h2 className="text-[28px] font-extrabold font-display text-gray-900 tracking-tight mb-2">
          Create account
        </h2>
        <p className="text-[14px] text-gray-500 font-medium mb-8">
          Start tracking your spending today — free forever.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            inverse
            label="Full Name"
            placeholder="Adeola Okafor"
            value={form.name}
            onChange={setField('name')}
            error={errors.name}
          />
          <Input
            inverse
            label="Email"
            type="email"
            placeholder="adeola@spendwise.ng"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
          />
          <Input
            inverse
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
          />

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
            Create Account
          </Button>
        </form>

        <p className="text-center text-[14px] text-gray-500 mt-8">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-rust font-bold hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
          By creating an account you agree to our{' '}
          <span className="text-rust/70 cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-rust/70 cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}