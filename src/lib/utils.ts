// src/lib/utils.ts

type ClassValue = string | boolean | null | undefined;

/** Merge Tailwind class strings, filtering falsy values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ');
}

/** Format a number as Nigerian Naira (₦). */
export function formatNaira(amount: number): string {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/** Human-readable relative time string. */
export function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

/** Greeting string based on local hour. */
export function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/** Clamp a number between min and max (inclusive). */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Extract up to two initials from a full name. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
