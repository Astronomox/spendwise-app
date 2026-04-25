// src/components/landing/Personas.tsx
import { motion } from 'framer-motion';

interface Persona {
  name:    string;
  age:     number;
  city:    string;
  problem: string;
  outcome: string;
}

const PERSONAS: Persona[] = [
  {
    name:    'Ayo',
    age:     27,
    city:    'Lagos',
    problem: 'Earns well. Spends freely. Saves nothing.',
    outcome: 'Now knows exactly where every naira goes.',
  },
  {
    name:    'Chisom',
    age:     23,
    city:    'Abuja',
    problem: 'First salary. Zero plan for it.',
    outcome: 'Built her first savings streak in month one.',
  },
  {
    name:    'Kemi',
    age:     34,
    city:    'Lagos',
    problem: 'Running a business. Revenue is not profit.',
    outcome: 'Separated personal and business spend. First profitable quarter.',
  },
];

const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Personas(): React.JSX.Element {
  return (
    <section id="who-its-for" className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="font-display font-extrabold text-[#1A1A1A] mb-14 max-w-[640px]"
          style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1 }}
        >
          Built for every Nigerian who's ever watched their money disappear.
        </motion.h2>

        <motion.div
          variants={gridVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {PERSONAS.map((p) => (
            <motion.div
              key={p.name}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E8E8E8] border-l-[3px] border-l-[#B7410E] p-7
                         hover:border-[#B7410E] transition-colors duration-200"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              {/* Header */}
              <div className="mb-4">
                <p className="font-display font-bold text-[18px] text-[#1A1A1A]">{p.name}</p>
                <p className="text-[13px] text-[#9B9B9B]">{p.age} · {p.city}</p>
              </div>

              {/* Problem */}
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-5">{p.problem}</p>

              {/* Divider */}
              <div className="border-t border-[#E8E8E8] mb-5" />

              {/* Outcome */}
              <p className="text-[14px] text-[#1A1A1A] leading-relaxed">
                <span className="font-bold text-[#B7410E]">Now: </span>
                {p.outcome}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
