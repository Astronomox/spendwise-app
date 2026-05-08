// src/components/landing/Stats.tsx
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const BANKS = [
  'GTBank', 'Zenith Bank', 'Kuda', 'Access Bank', 'First Bank',
  'UBA', 'OPay', 'Moniepoint', 'Palmpay', 'Wema Bank',
  'Stanbic IBTC', 'Sterling Bank', 'Fidelity Bank', 'Union Bank',
  'Polaris Bank', 'Keystone Bank', 'Jaiz Bank', 'Heritage Bank',
  'Providus Bank', 'Titan Trust', 'SunTrust Bank', 'Globus Bank',
  'Taj Bank', 'Lotus Bank', 'Carbon', 'Fairmoney', 'VFD Microfinance',
  'Renmoney', 'Eyowo', 'Sparkle',
];

interface Stat {
  prefix?: string;
  value: number;
  suffix?: string;
  label: string;
  isRaw?: boolean;
  raw?: string;
}

const STATS: Stat[] = [];

function AnimatedStat({ stat, active }: { stat: Stat; active: boolean }): React.JSX.Element {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active || stat.isRaw) return;
    const target = stat.value;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(parseFloat((e * target).toFixed(target % 1 !== 0 ? 1 : 0)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, stat.value, stat.isRaw]);

  const rendered = stat.isRaw
    ? stat.raw
    : `${stat.prefix ?? ''}${display}${stat.suffix ?? ''}`;

  return (
    <div className="text-center px-4">
      <p className="font-display font-extrabold text-white leading-none mb-3"
        style={{ fontSize: 'clamp(48px, 7vw, 80px)', whiteSpace: 'nowrap' }}>
        {rendered}
      </p>
      <p className="text-[14px] text-white/60 font-medium">{stat.label}</p>
    </div>
  );
}

const tickerKeyframes = `
  @keyframes stats-ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-33.333%); }
  }
`;

export default function Stats(): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const ticker = [...BANKS, ...BANKS, ...BANKS];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-24 overflow-hidden"
      style={{ background: '#B7410E' }}
    >
      <style dangerouslySetInnerHTML={{ __html: tickerKeyframes }} />

      {/* Stats row */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} active={inView} />
          ))}
        </div>
      </div>

      {/* Name ticker */}
      <div className="overflow-hidden">
        <div
          className="flex items-center gap-12"
          style={{ width: 'max-content', animation: 'stats-ticker 40s linear infinite' }}
        >
          {ticker.map((bank, i) => (
            <span key={i} className="text-[13px] text-white/50 font-medium shrink-0">
              {bank}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}