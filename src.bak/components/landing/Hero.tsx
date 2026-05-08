// src/components/landing/Hero.tsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const lineVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const BANKS = ['GTBank', 'Zenith', 'Kuda', 'Access', 'First Bank', 'UBA', 'OPay'];

export default function Hero(): React.JSX.Element {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center bg-white overflow-hidden pt-16"
      style={{
        backgroundImage: `
          linear-gradient(rgba(26,26,26,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,26,26,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-24 md:py-32 w-full">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Eyebrow */}
          <motion.p
            variants={lineVariants}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#B7410E] mb-8"
          >
            Personal Finance · Nigeria
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={containerVariants}
            className="font-display font-extrabold leading-[0.93] mb-8"
            style={{ fontSize: 'clamp(52px, 8vw, 110px)' }}
          >
            <motion.span variants={lineVariants} className="block text-[#1A1A1A]">
              Track every naira.
            </motion.span>
            <motion.span variants={lineVariants} className="block text-[#B7410E]">
              Build real wealth.
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={lineVariants}
            className="text-[18px] text-[#6B6B6B] max-w-[520px] leading-relaxed mb-10"
          >
            Your bank sends an SMS every time you spend. SpendWise turns every one of them
            into a complete picture of your money.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={lineVariants} className="flex flex-wrap items-center gap-5 mb-16">
            <a
              href="#cta"
              className="bg-[#B7410E] hover:bg-[#8C3209] text-white font-semibold text-[15px]
                         px-7 py-3.5 rounded-full transition-colors duration-200"
            >
              Join the Waitlist
            </a>
            <a
              href="#how-it-works"
              className="text-[#1A1A1A] font-medium text-[15px] hover:text-[#B7410E] transition-colors duration-150"
            >
              See how it works →
            </a>
          </motion.div>

          {/* Bank row */}
          <motion.div variants={lineVariants} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[13px] text-[#9B9B9B] font-medium">Works with</span>
            {BANKS.map((bank) => (
              <span key={bank} className="text-[13px] text-[#9B9B9B]">{bank}</span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
