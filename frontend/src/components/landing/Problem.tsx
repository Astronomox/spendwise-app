// src/components/landing/Problem.tsx
import { motion } from 'framer-motion';

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 },
  }),
};

interface ProblemCard {
  bold: string;
  sub:  string;
}

const CARDS: ProblemCard[] = [
  { bold: '₦150,000 gone. No idea how.',        sub: 'End of month, zero balance. Every single month.' },
  { bold: 'Bank alert fear is real.',             sub: 'That sinking feeling every time your phone buzzes.' },
  { bold: 'Spreadsheets are not it.',             sub: 'Column G: misc expenses = ₦48,000 ???' },
];

export default function Problem(): React.JSX.Element {
  return (
    <section id="features" className="py-24 bg-[#FAFAF8]">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#B7410E] mb-5"
        >
          The Brutal Truth
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display font-extrabold text-[#1A1A1A] mb-14"
          style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1 }}
        >
          You're earning. You're bleeding.<br />You don't know where.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -3 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E8E8E8] border-l-[3px] border-l-[#B7410E] p-7
                         hover:border-[#B7410E] transition-colors duration-200"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <p className="font-display font-bold text-[18px] text-[#1A1A1A] mb-3 leading-snug">
                {card.bold}
              </p>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
