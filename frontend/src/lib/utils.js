// src/lib/utils.js

/** Merge Tailwind class names, filtering falsy values. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Format a number as Nigerian Naira. */
export function formatNaira(amount) {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/** Human-readable time ago string. */
export function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

/** Greeting based on time of day. */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/** Clamp a number between min and max. */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Get initials from a full name. */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
