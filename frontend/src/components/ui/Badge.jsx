// src/components/ui/Badge.jsx
import { cn } from '@/lib/utils';

const presets = {
  rust:    'bg-rust/15    text-rust    border-rust/25',
  success: 'bg-success/15 text-success border-success/25',
  danger:  'bg-danger/15  text-danger  border-danger/25',
  warning: 'bg-warning/15 text-warning border-warning/25',
  muted:   'bg-white/[0.06] text-cream/55 border-white/[0.1]',
};

/**
 * @param {{ preset?: keyof presets, color?: string } & React.HTMLAttributes<HTMLSpanElement>} props
 */
export default function Badge({ children, preset = 'rust', color, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-[11px] font-bold tracking-wide uppercase border',
        !color && presets[preset],
        className
      )}
      style={color ? {
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
      } : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
