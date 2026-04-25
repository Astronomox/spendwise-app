// src/components/landing/CTA.tsx
import { useState }   from 'react';
import { motion }     from 'framer-motion';
import { cn }         from '@/lib/utils';

export default function CTA(): React.JSX.Element {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section id="cta" className="py-24 bg-white">
      <div className="max-w-[640px] mx-auto px-6 text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }}
          className="font-display font-extrabold leading-[0.93] mb-8"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}
        >
          <span className="block text-[#1A1A1A]">YOUR MONEY.</span>
          <span className="block text-[#B7410E]">YOUR RULES.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[17px] text-[#6B6B6B] mb-10 leading-relaxed"
        >
          Join the waitlist. Be first when SpendWise opens publicly.
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.18 }}
          className="flex flex-col sm:flex-row gap-3 mb-4"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="your@email.com"
            disabled={submitted}
            className={cn(
              'flex-1 px-5 py-3.5 rounded-full border text-[15px] outline-none',
              'placeholder:text-[#B0B0B0] transition-colors duration-200',
              'focus:border-[#B7410E]',
              error ? 'border-red-400' : 'border-[#E8E8E8]',
              submitted && 'opacity-50 cursor-not-allowed'
            )}
          />
          <button
            type="submit"
            disabled={submitted}
            className={cn(
              'px-7 py-3.5 rounded-full font-semibold text-[15px] transition-colors duration-200 whitespace-nowrap',
              submitted
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-[#B7410E] hover:bg-[#8C3209] text-white'
            )}
          >
            {submitted ? "You're in ✓" : 'Join Waitlist'}
          </button>
        </motion.form>

        {/* Error */}
        {error && <p className="text-[13px] text-red-500 mb-4">{error}</p>}

        {/* Disclaimer */}
        <p className="text-[12px] text-[#9B9B9B]">
          No spam. Just your early access link.
        </p>

        {/* Divider + footer */}
        <div className="border-t border-[#E8E8E8] mt-16 pt-8">
          <p className="text-[13px] text-[#9B9B9B]">
            SpendWise · Built by Adeola · Semilore · Oreoluwa · © 2026
          </p>
        </div>
      </div>
    </section>
  );
}
