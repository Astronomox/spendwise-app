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
      className="flex flex-col h-full bg-[var(--color-bg-secondary)]"
    >
      <div className="px-[24px] pt-[32px] pb-[16px] border-b border-[var(--color-border)] shrink-0 shadow-[var(--shadow-shadow-sm)] z-10 bg-[var(--color-bg-secondary)]">
        <h1 className="text-[28px] font-bold font-display tracking-tight leading-tight">Alerts</h1>
        <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">Stay on top of your finances.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-[16px]">
          <RefreshIcon className="animate-spin text-[var(--color-accent)]" size={32} />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-[24px] text-center space-y-[24px]">
          <div className="w-[80px] h-[80px] bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center text-[var(--color-text-muted)] border border-[var(--color-border)]">
            <AlertsIcon size={40} />
          </div>
          <div className="space-y-[8px]">
            <h3 className="font-bold text-[20px] font-display text-[var(--color-text-primary)]">All caught up</h3>
            <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">You have no new alerts at this time.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-[24px] space-y-[16px] pb-[96px]">
          {alerts.map((alert: Alert) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={alert.id}
                onClick={() => {
                  if (!alert.read) {
                    void markRead(alert.id).catch(() => {});
                  }
                }}
                className={cn(
                  "p-[20px] rounded-[16px] border-[1px] transition-all cursor-pointer flex gap-[16px]",
                  alert.read
                    ? "bg-[var(--color-bg-secondary)] border-[var(--color-border)] opacity-70"
                    : "bg-[var(--color-bg-elevated)] border-l-[4px] border-l-[var(--color-accent)] border-y-[var(--color-border)] border-r-[var(--color-border)] shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)]"
                )}
              >
                <div className={cn("w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 border border-black/5", styles.bg)} style={{ color: styles.color }}>
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <h4 className={cn("text-[15px] mb-[4px] font-display tracking-tight text-[var(--color-text-primary)]", alert.read ? "font-[600]" : "font-bold")}>{alert.title}</h4>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed font-[500]">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
