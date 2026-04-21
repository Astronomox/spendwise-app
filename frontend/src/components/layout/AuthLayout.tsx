// src/components/layout/AuthLayout.tsx
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const BULLETS = [
  'Auto-log from SMS',
  'Spend with intention',
  'Share your progress',
];

export function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full bg-forge-bg overflow-hidden flex-col lg:flex-row">

      {/* Mobile header */}
      <header className="lg:hidden h-14 w-full bg-forge-surface flex items-center justify-center shrink-0 border-b border-white/[0.06]">
        <h1 className="text-[20px] font-black font-display text-gradient-rust tracking-tight">
          SpendWise.
        </h1>
      </header>

      {/* Desktop left panel */}
      <div className="hidden lg:flex w-1/2 h-screen bg-forge-surface border-r border-white/[0.06] relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract SVG backdrop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <svg width="480" height="480" viewBox="0 0 400 400" fill="none">
            <path d="M100 300C40 200 150 100 200 50C250 0 350 50 380 150C410 250 300 350 200 380C100 410 160 400 100 300Z" fill="#B7410E" fillOpacity="0.35"/>
            <path d="M20 200C20 100 100 20 200 20C300 20 380 100 380 200C380 300 300 380 200 380C100 380 20 300 20 200Z"  fill="#F59E0B" fillOpacity="0.20"/>
            <path d="M150 350C80 300 50 200 100 120C150 40 250 50 320 100C390 150 400 250 350 320C300 390 220 400 150 350Z" fill="#10B981" fillOpacity="0.15"/>
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-[28px] font-black font-display text-gradient-rust tracking-tight">
            SpendWise.
          </h1>
        </div>

        {/* Headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <h2 className="text-[36px] font-black font-display text-cream leading-tight mb-3">
            Track every naira.
          </h2>
          <p className="text-[16px] text-cream/50 font-medium">
            Build wealth on your terms.
          </p>
        </div>

        {/* Bullets */}
        <div className="relative z-10 flex flex-col gap-4">
          {BULLETS.map((text) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-rust/20 flex items-center justify-center shrink-0">
                <CheckCircle size={12} className="text-rust" />
              </div>
              <span className="text-[15px] text-cream/60 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex-1 bg-forge-bg lg:h-screen overflow-y-auto flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
