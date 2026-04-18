import React, { ReactNode, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAppStore } from '@/src/lib/store';
import { 
  HomeIcon, 
  HistoryIcon, 
  GoalsIcon, 
  AlertsIcon, 
  PlusCircleIcon,
  NotificationIcon
} from '@/src/components/ui/icons';
import { useAlerts } from '@/src/hooks/useAlerts';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Only apply auth layout strictly to login/signup. Onboarding uses app-container.
  const isAuthLayoutPage = location.pathname === '/auth/login' || location.pathname === '/auth/signup';

  // Don't show shell on any auth page (login, signup, onboarding)
  const isAuthPage = location.pathname.startsWith('/auth');

  // Hide bottom nav on logger page for full focus
  const isLoggerPage = location.pathname === '/logger';

  const { alerts } = useAlerts({ enabled: !isAuthPage });

  const unreadAlerts = alerts?.filter(a => !a.read).length || 0;

  const handleScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  if (isAuthPage) {
    return <div className={isAuthLayoutPage ? "auth-container" : "app-container"}>{children}</div>;
  }

  return (
    <div className="app-container">
      {/* Status Bar (Mock) */}
      <div className="h-[40px] px-[24px] flex justify-between items-center text-[12px] font-[600] shrink-0">
        <span>9:41</span>
        <div className="flex gap-[8px]">
          <span>LTE</span>
          <span>100%</span>
        </div>
      </div>

      {/* Header - Hidden on Logger */}
      {!isLoggerPage && (
        <header className="h-[56px] px-[24px] flex justify-between items-center shrink-0">
          <h1 className="text-[20px] font-black text-[var(--color-accent)] font-display">SpendWise.</h1>
          <div className="flex items-center gap-[16px]">
            <button onClick={() => navigate('/alerts')} className="relative p-[4px] text-[var(--color-text-secondary)]">
              <NotificationIcon size={22} />
              {unreadAlerts > 0 && (
                <span className="absolute top-0 right-0 bg-[var(--color-danger)] text-white text-[9px] font-bold h-[16px] min-w-[16px] flex items-center justify-center rounded-full px-[4px]">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>
            <div className="w-[36px] h-[36px] bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center border-[1px] border-[var(--color-border)] text-[12px] font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pb-[calc(72px+env(safe-area-inset-bottom))]" onScroll={handleScroll}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isLoggerPage && (
        <nav
          className={cn(
            "fixed bottom-0 max-w-[400px] w-full mx-auto h-[calc(72px+env(safe-area-inset-bottom))] bg-[var(--color-bg-secondary)] flex justify-around items-center pb-[calc(16px+env(safe-area-inset-bottom))] z-50 transition-all duration-200",
            isScrolled ? "border-t-[1px] border-[var(--color-border)] shadow-[var(--shadow-shadow-lg)]" : "border-t-transparent"
          )}
        >
          <NavTab to="/dashboard" icon={<HomeIcon size={24} />} label="Home" />
          <NavTab to="/history" icon={<HistoryIcon size={24} />} label="History" />
          
          {/* Central Plus Button */}
          <button 
            onClick={() => navigate('/logger')}
            className="relative -mt-[20px] active:scale-[0.97] transition-transform flex items-center justify-center"
          >
            <div className="w-[52px] h-[52px] bg-[var(--color-accent)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] shadow-[var(--shadow-shadow-accent)] ring-[4px] ring-[var(--color-bg-secondary)]">
              <PlusCircleIcon size={24} />
            </div>
          </button>

          <NavTab to="/goals" icon={<GoalsIcon size={24} />} label="Goals" />
          <NavTab to="/alerts" icon={<AlertsIcon size={24} />} label="Alerts" />
        </nav>
      )}
    </div>
  );
}

function NavTab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center gap-1 transition-all duration-150 relative',
          isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative flex flex-col items-center gap-1">
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-dot"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-accent rounded-full"
              />
            )}
          </div>
        </>
      )}
    </NavLink>
  );
}
