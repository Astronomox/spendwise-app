import React from 'react';
import { motion } from 'motion/react';
import { useAlerts } from '@/src/hooks/useAlerts';
import { cn } from '@/src/lib/utils';
import { RefreshIcon, FlameIcon, WarningIcon, CelebrationIcon, HighSpendIcon, AlertsIcon } from '@/src/components/ui/icons';
import { AlertType, Alert } from '@/src/types/alerts';

const getAlertStyles = (type: AlertType) => {
  switch (type) {
    case 'high_spend':
      return { icon: <HighSpendIcon size={20} />, color: 'var(--color-danger)', bg: 'bg-danger/10' };
    case 'streak':
      return { icon: <FlameIcon size={20} />, color: 'var(--color-warning)', bg: 'bg-warning/10' };
    case 'budget_warning':
      return { icon: <WarningIcon size={20} />, color: 'var(--color-warning)', bg: 'bg-warning/10' };
    case 'goal_reached':
      return { icon: <CelebrationIcon size={20} />, color: 'var(--color-accent)', bg: 'bg-accent/10' };
    default:
      return { icon: <AlertsIcon size={20} />, color: 'var(--color-text-secondary)', bg: 'bg-gray-100' };
  }
};

export default function AlertsPage() {
  const { alerts, isLoading, markRead } = useAlerts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-white"
    >
      <div className="px-6 pt-8 pb-4 border-b border-gray-100 shrink-0">
        <h1 className="text-[28px] font-black tracking-tight">Alerts</h1>
        <p className="text-text-secondary text-[14px]">Stay on top of your finances.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshIcon className="animate-spin text-accent" size={32} />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-text-secondary">
            <AlertsIcon size={32} />
          </div>
          <div>
            <h3 className="font-bold text-[18px]">All caught up</h3>
            <p className="text-text-secondary text-[14px]">You have no new alerts at this time.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
          {alerts.map((alert: Alert) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={alert.id}
                onClick={() => !alert.read && markRead(alert.id)}
                className={cn(
                  "p-4 rounded-radius-md border transition-all cursor-pointer flex gap-4",
                  alert.read
                    ? "bg-white border-gray-100 opacity-80"
                    : "bg-bg-elevated border-l-4 border-l-accent border-gray-200"
                )}
              >
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", styles.bg)} style={{ color: styles.color }}>
                  {styles.icon}
                </div>
                <div>
                  <h4 className={cn("text-[15px] mb-1", alert.read ? "font-semibold" : "font-black")}>{alert.title}</h4>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
