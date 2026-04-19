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
    return <div className={isAuthLayoutPage ? "auth-container" : "app-container max-w-[1200px] mx-auto"}>{children}</div>;
  }

  const handleSignOut = () => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
    window.location.href = '/auth/login';
  };

  return (
    <div className="app-container flex lg:flex-row">
      {/* Desktop Sidebar Navigation */}
      {!isLoggerPage && (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex-col z-50 py-[24px]">
          <div className="px-[24px] mb-[40px]">
            <h1 className="text-[28px] font-black text-[var(--color-accent)] font-display">SpendWise.</h1>
          </div>

          <nav className="flex-1 flex flex-col gap-[8px] px-[16px]">
            <SidebarTab to="/dashboard" icon={<HomeIcon size={20} />} label="Home" />
            <SidebarTab to="/history" icon={<HistoryIcon size={20} />} label="History" />
            <SidebarTab to="/goals" icon={<GoalsIcon size={20} />} label="Goals" />
            <SidebarTab to="/alerts" icon={<AlertsIcon size={20} />} label="Alerts" badge={unreadAlerts} />

            <div className="mt-[24px] pt-[24px] border-t border-[var(--color-border)]">
              <button
                onClick={() => navigate('/logger')}
                className="w-full h-[48px] bg-[var(--color-accent)] text-white rounded-[12px] flex items-center justify-center gap-[8px] font-bold shadow-[var(--shadow-shadow-accent)] hover:scale-[0.98] transition-transform"
              >
                <PlusCircleIcon size={20} className="text-white" />
                <span>Log Cash</span>
              </button>
            </div>
          </nav>

          <div className="mt-auto px-[16px]">
            <div className="p-[12px] bg-[var(--color-bg-elevated)] rounded-[16px] border border-[var(--color-border)] flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center border-[1px] border-[var(--color-border)] text-[12px] font-bold shrink-0">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[var(--color-text-primary)] truncate">{user?.fullName}</p>
                <button onClick={handleSignOut} className="text-[11px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col w-full relative",
        !isLoggerPage && "lg:ml-[240px]"
      )}>
        {/* Mobile Header - Hidden on Logger */}
        {!isLoggerPage && (
          <header className="lg:hidden h-[56px] px-[16px] flex justify-between items-center shrink-0 w-full max-w-[1200px] mx-auto">
            <h1 className="text-[20px] font-black text-[var(--color-accent)] font-display">SpendWise.</h1>
            <div className="flex items-center gap-[16px]">
              <button onClick={() => navigate('/alerts')} className="relative p-[4px] text-[var(--color-text-secondary)]" aria-label="Notifications">
                <NotificationIcon size={22} />
                {unreadAlerts > 0 && (
                  <span className="absolute top-0 right-0 bg-[var(--color-danger)] text-white text-[9px] font-bold h-[16px] min-w-[16px] flex items-center justify-center rounded-full px-[4px]">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </button>
              <div className="w-[36px] h-[36px] bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center border-[1px] border-[var(--color-border)] text-[12px] font-bold">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
              </div>
            </div>
          </header>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto w-full" onScroll={handleScroll}>
          <div className={cn(
            "max-w-[1200px] w-full mx-auto pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-[48px]",
            !isLoggerPage && "lg:px-[48px] px-[16px]"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {!isLoggerPage && (
        <nav
          className={cn(
            "lg:hidden fixed bottom-0 w-full h-[calc(72px+env(safe-area-inset-bottom))] bg-[var(--color-bg-secondary)] flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-50 transition-all duration-200 left-0 right-0",
            isScrolled ? "border-t-[1px] border-[var(--color-border)] shadow-[var(--shadow-shadow-lg)]" : "border-t-transparent"
          )}
        >
          <NavTab to="/dashboard" icon={<HomeIcon size={24} />} label="Home" />
          <NavTab to="/history" icon={<HistoryIcon size={24} />} label="History" />

          {/* Central Plus Button */}
          <button
            onClick={() => navigate('/logger')}
            aria-label="Log Cash"
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

function SidebarTab({ to, icon, label, badge }: { to: string; icon: ReactNode; label: string; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-[12px] h-[48px] px-[16px] rounded-[12px] transition-all duration-150',
          isActive
            ? 'bg-[rgba(0,135,81,0.1)] text-[var(--color-accent)] border-l-[3px] border-[var(--color-accent)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] border-l-[3px] border-transparent'
        )
      }
    >
      {icon}
      <span className="font-[600] text-[15px]">{label}</span>
      {badge ? (
        <span className="ml-auto bg-[var(--color-danger)] text-white text-[11px] font-bold h-[20px] min-w-[20px] flex items-center justify-center rounded-full px-[6px]">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </NavLink>
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
