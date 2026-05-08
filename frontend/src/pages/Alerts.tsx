// src/pages/Alerts.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Flame, AlertTriangle, TrendingUp, Sparkles, type LucideIcon } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { getTimeAgo, cn } from '@/lib/utils';
import type { Alert, AlertType } from '@/types/alerts';
import Badge from '@/components/ui/Badge';

// ——— Alert metadata ———

interface AlertMeta {
  Icon:   LucideIcon;
  color:  string;
}

const ALERT_META: Record<AlertType, AlertMeta> = {
  budget_warning: { Icon: AlertTriangle, color: '#FBBF24' },
  high_spend:     { Icon: TrendingUp,    color: '#F43F5E' },
  streak:         { Icon: Flame,         color: '#F59E0B' },
  goal_reached:   { Icon: Sparkles,      color: '#2DB37A' },
};

// ——— Alert card ———

interface AlertCardProps {
  alert:   Alert;
  onRead:  (id: string) => void;
}

function AlertCard({ alert, onRead }: AlertCardProps): React.JSX.Element {
  const meta  = ALERT_META[alert.type];
  const Icon  = meta.Icon;

  return (
    <motion.div
      whileHover={!alert.read ? { x: 2 } : undefined}
      onClick={() => { if (!alert.read) onRead(alert.id); }}
      className={cn(
        'p-5 rounded-3xl border flex gap-4 transition-all duration-200',
        alert.read
          ? 'bg-transparent border-white/[0.06] opacity-55'
          : 'bg-forge-surface border-white/[0.10] cursor-pointer hover:shadow-card'
      )}
      style={!alert.read ? { borderLeft: `3px solid ${meta.color}` } : undefined}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
          color: meta.color,
        }}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn(
            'text-[15px] font-display text-cream leading-snug',
            alert.read ? 'font-semibold' : 'font-bold'
          )}>
            {alert.title}
          </h4>
          {!alert.read && (
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: meta.color }}
            />
          )}
        </div>
        <p className="text-[13px] text-cream/50 font-medium leading-relaxed">{alert.message}</p>
        <p className="text-[11px] text-cream/25 font-medium mt-2">{getTimeAgo(alert.createdAt)}</p>
      </div>
    </motion.div>
  );
}

// ——— Alerts page ———

export default function Alerts(): React.JSX.Element {
  const { alerts, isLoading, markRead: markReadApi } = useAlerts();
  const unread = alerts.filter(a => !a.read).length;

  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  const displayAlerts = alerts.map(a =>
    localReadIds.has(a.id) ? { ...a, read: true } : a
  );

  const markRead = async (id: string): Promise<void> => {
    setLocalReadIds(prev => new Set(prev).add(id));
    try {
      await markReadApi(id);
    } catch {
      // API not available yet — local state already updated
    }
  };

  const sorted = [...displayAlerts].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="pt-6 pb-8">

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold font-display text-cream tracking-tight">Alerts</h1>
          <p className="text-[14px] text-cream/40 font-medium mt-1">Stay on top of your finances.</p>
        </div>
        {unread > 0 && <Badge preset="danger">{unread} new</Badge>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl bg-forge-surface animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-forge-elevated border border-white/[0.06] flex items-center justify-center">
            <Bell size={28} className="text-cream/20" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-cream mb-1">All caught up</p>
            <p className="text-[14px] text-cream/40">No alerts right now. Keep it up!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(alert => (
            <AlertCard key={alert.id} alert={alert} onRead={(id) => { void markRead(id); }} />
          ))}
        </div>
      )}
    </div>
  );
}