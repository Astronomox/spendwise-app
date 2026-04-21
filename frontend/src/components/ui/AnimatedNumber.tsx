// src/components/ui/AnimatedNumber.tsx
import { useEffect, useState } from 'react';

export interface AnimatedNumberProps {
  value:     number;
  format?:   'number' | 'pct';
  duration?: number;
}

/**
 * Counts from 0 → value with a cubic ease-out animation.
 * Re-animates whenever `value` changes.
 */
export default function AnimatedNumber({
  value,
  format   = 'number',
  duration = 900,
}: AnimatedNumberProps): React.JSX.Element {
  const [display, setDisplay] = useState<number>(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();

    const tick = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      // cubic ease-out
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
