import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { CheckCircleIcon } from '@/src/components/ui/icons';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg-secondary)] overflow-hidden flex-col lg:flex-row">
      {/* Mobile Header (< 1024px) */}
      <header className="lg:hidden h-[56px] w-full bg-[var(--color-bg-primary)] flex items-center justify-center shrink-0">
        <h1 className="text-[20px] font-bold font-display text-white tracking-[1px]">SpendWise.</h1>
      </header>

      {/* Left Panel (Desktop >= 1024px) */}
      <div className="hidden lg:flex w-1/2 h-screen auth-hero-gradient relative flex-col justify-between p-[48px] overflow-hidden">
        {/* Layer 1: Abstract SVG Composition */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 300C40 200 150 100 200 50C250 0 350 50 380 150C410 250 300 350 200 380C100 410 160 400 100 300Z"
              fill="var(--color-accent)" fillOpacity="0.2"
            />
            <path
              d="M20 200C20 100 100 20 200 20C300 20 380 100 380 200C380 300 300 380 200 380C100 380 20 300 20 200Z"
              fill="var(--color-warning)" fillOpacity="0.15"
            />
            <path
              d="M150 350C80 300 50 200 100 120C150 40 250 50 320 100C390 150 400 250 350 320C300 390 220 400 150 350Z"
              fill="var(--color-success)" fillOpacity="0.1"
            />
          </svg>
        </div>

        {/* Layer 2: Logo */}
        <div className="relative z-10">
          <h1 className="text-[32px] font-bold font-display text-white tracking-[1px]">SpendWise.</h1>
        </div>

        {/* Layer 3 & 4: Heading and Subtext */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[400px]">
          <h2 className="text-[32px] font-bold font-display text-white leading-tight mb-[8px]">
            Track every naira.
          </h2>
          <p className="text-[16px] font-[400] text-white/60 font-body">
            Build wealth on your terms.
          </p>
        </div>

        {/* Layer 5: Feature Bullets */}
        <div className="relative z-10 h-[20%] flex flex-col justify-end space-y-[16px] min-[800px]:flex hidden">
          <div className="flex items-center gap-[12px]">
            <div className="w-[20px] h-[20px] rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]">
              <CheckCircleIcon size={12} strokeWidth={3} />
            </div>
            <span className="text-[16px] font-[400] text-white/70 font-body">Auto-log from SMS</span>
          </div>
          <div className="flex items-center gap-[12px]">
            <div className="w-[20px] h-[20px] rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]">
              <CheckCircleIcon size={12} strokeWidth={3} />
            </div>
            <span className="text-[16px] font-[400] text-white/70 font-body">Spend with intention</span>
          </div>
          <div className="flex items-center gap-[12px]">
            <div className="w-[20px] h-[20px] rounded-full bg-white/10 flex items-center justify-center text-[var(--color-accent)]">
              <CheckCircleIcon size={12} strokeWidth={3} />
            </div>
            <span className="text-[16px] font-[400] text-white/70 font-body">Share your progress</span>
          </div>
        </div>
      </div>

      {/* Right Panel (Form Container) */}
      <div className="w-full lg:w-1/2 flex-1 bg-white lg:h-screen overflow-y-auto flex items-center justify-center p-[24px] lg:p-[48px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
