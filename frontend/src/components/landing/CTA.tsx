// src/components/landing/CTA.tsx
import { motion } from 'framer-motion';

export default function CTA(): React.JSX.Element {
  return (
    <section id="cta" className="py-24 bg-white">
      <div className="max-w-[640px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="font-display font-extrabold leading-[0.93] mb-8"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}
        >
          <span className="block text-[#1A1A1A]">YOUR MONEY.</span>
          <span className="block text-[#B7410E]">YOUR RULES.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[17px] text-[#6B6B6B] mb-10 leading-relaxed"
        >
          Start tracking your spending today. Free forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-4"
        >
          <a
            href="/auth/signup"
            className="px-8 py-3.5 rounded-full font-semibold text-[15px] bg-[#B7410E] hover:bg-[#8C3209] text-white transition-colors duration-200"
          >
            Create Free Account
          </a>
          <a
            href="/auth/login"
            className="px-8 py-3.5 rounded-full font-semibold text-[15px] border border-[#E8E8E8] text-[#1A1A1A] hover:border-[#B7410E] hover:text-[#B7410E] transition-colors duration-200"
          >
            Login
          </a>
        </motion.div>

        <div className="border-t border-[#E8E8E8] mt-16 pt-8">
          <p className="text-[13px] text-[#9B9B9B]">
            SpendWise · Built by Adeola · Semilore · Oreoluwa · © 2026
          </p>
        </div>
      </div>
    </section>
  );
}