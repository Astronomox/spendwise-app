// src/components/landing/Nav.tsx
import { useState, useEffect } from 'react';
import { motion }              from 'framer-motion';
import { cn }                  from '@/lib/utils';

export default function Nav(): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white border-b border-[#E8E8E8]' : 'bg-transparent'
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span className="font-display font-extrabold text-[20px] text-[#1A1A1A] tracking-tight">
          SpendWise
        </span>

        {/* Links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {(['How it works', 'Features', "Who it's for"] as const).map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')}`}
              className="text-[14px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#cta"
          className="bg-[#B7410E] hover:bg-[#8C3209] text-white text-[14px] font-semibold
                     px-5 py-2.5 rounded-full transition-colors duration-200"
        >
          Get Early Access
        </a>
      </div>
    </motion.nav>
  );
}
