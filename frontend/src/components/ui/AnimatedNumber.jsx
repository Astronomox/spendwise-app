// src/components/ui/AnimatedNumber.jsx
import { useEffect, useState } from 'react';

/**
 * Counts from 0 to `value` with an eased animation.
 * @param {{ value: number, format?: 'number' | 'pct', duration?: number }} props
 */
export default function AnimatedNumber({ value, format = 'number', duration = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  if (format === 'pct') return <span>{display}</span>;
  return <span>{display.toLocaleString('en-NG')}</span>;
}
