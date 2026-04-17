import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  format?: 'currency' | 'number' | 'percentage';
}

export function AnimatedNumber({ value, className = '', duration = 900, format = 'number' }: AnimatedNumberProps) {
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const displayValue = useTransform(springValue, (current) => {
    const rounded = Math.round(current);
    if (format === 'percentage') {
      return rounded.toString();
    }
    return rounded.toLocaleString();
  });

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
