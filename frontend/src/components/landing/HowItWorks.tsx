// src/components/landing/HowItWorks.tsx
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HowItWorks(): React.JSX.Element {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#B7410E] mb-5"
        >
          How It Works
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display font-extrabold text-[#1A1A1A] mb-16"
          style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1 }}
        >
          SMS in. Insight out.
        </motion.h2>

        <motion.div
          variants={sectionVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {/* Dashed connector — desktop only */}
          <div className="hidden md:block absolute top-[36px] left-[calc(33.33%+16px)] right-[calc(33.33%+16px)]
                          border-t-2 border-dashed border-[#E8E8E8]" />

          {/* Step 1 */}
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute -top-4 left-0 font-display font-extrabold text-[80px]
                             text-[#E8E8E8] leading-none select-none">1</span>
            <div className="relative pt-10">
              <p className="font-display font-bold text-[18px] text-[#1A1A1A] mb-4">
                Your bank alerts you
              </p>
              <div className="bg-[#F0F0F0] rounded-xl p-4 font-mono text-[12px] text-[#333] leading-relaxed">
                <p className="text-[10px] text-[#888] mb-1">GTBank · 12-Apr-2025 · 14:32</p>
                Acct: *7741 Debit ₦4,500.00<br />
                at CHOWDECK LAGOS<br />
                Bal: ₦82,340.50
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute -top-4 left-0 font-display font-extrabold text-[80px]
                             text-[#E8E8E8] leading-none select-none">2</span>
            <div className="relative pt-10">
              <p className="font-display font-bold text-[18px] text-[#1A1A1A] mb-4">
                SpendWise parses it
              </p>
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4 space-y-3"
                   style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {[
                  { label: 'Category', val: 'Food & Drink', accent: true },
                  { label: 'Merchant', val: 'Chowdeck'                  },
                  { label: 'Amount',   val: '₦4,500.00'                 },
                  { label: 'Date',     val: '12 Apr 2025'               },
                ].map(({ label, val, accent }) => (
                  <div key={label} className="flex justify-between items-center text-[13px]">
                    <span className="text-[#6B6B6B]">{label}</span>
                    <span className={accent
                      ? 'bg-[rgba(183,65,14,0.1)] text-[#B7410E] text-[11px] font-bold px-2.5 py-0.5 rounded-full'
                      : 'font-semibold text-[#1A1A1A]'
                    }>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute -top-4 left-0 font-display font-extrabold text-[80px]
                             text-[#E8E8E8] leading-none select-none">3</span>
            <div className="relative pt-10">
              <p className="font-display font-bold text-[18px] text-[#1A1A1A] mb-4">
                You see everything
              </p>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed">
                Dashboard. Burn rate. Weekly chart. Category breakdown. Savings goals.
                All from SMS — no bank login, no manual entry.
              </p>
              <div className="mt-5 flex items-end gap-2 h-16">
                {[55, 80, 40, 95, 60, 70, 45].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#B7410E] rounded-t-sm opacity-80"
                       style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-[11px] text-[#9B9B9B] mt-1.5">Weekly spend · this month</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
