// src/components/landing/Features.tsx
import { motion }        from 'framer-motion';
import { MessageSquare, TrendingDown, Flame, Target, Share2, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  Icon:  LucideIcon;
  title: string;
  desc:  string;
}

const FEATURES: Feature[] = [
  { Icon: MessageSquare, title: 'SMS Auto-Logging',  desc: '8 Nigerian banks. Zero manual entry.' },
  { Icon: TrendingDown,  title: 'Burn Rate',         desc: 'See exactly how fast you\'re spending your budget.' },
  { Icon: Flame,         title: 'Budget Streaks',    desc: 'Stay under budget daily. Build the discipline.' },
  { Icon: Target,        title: 'Savings Goals',     desc: 'Set a goal. Watch it fill. Hit it.' },
  { Icon: Share2,        title: 'Shareable Card',    desc: 'Your monthly recap. One tap to WhatsApp.' },
  { Icon: Bell,          title: 'Smart Alerts',      desc: 'Warnings before you overspend. Not after.' },
];

const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Features(): React.JSX.Element {
  return (
    <section id="features" className="py-24 bg-[#FAFAF8]">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#B7410E] mb-5"
        >
          What You Get
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display font-extrabold text-[#1A1A1A] mb-14"
          style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1 }}
        >
          Every naira. Every pattern.<br />Zero guesswork.
        </motion.h2>

        <motion.div
          variants={gridVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map(({ Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E8E8E8] border-l-[3px] border-l-[#B7410E] p-6
                         hover:border-[#B7410E] transition-colors duration-200 cursor-default"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <Icon size={20} className="text-[#B7410E] mb-4" />
              <p className="font-display font-bold text-[16px] text-[#1A1A1A] mb-1.5">{title}</p>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
