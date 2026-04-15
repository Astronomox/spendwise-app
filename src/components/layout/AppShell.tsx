import { ReactNode, useEffect } from 'react';
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
import { supabase } from '@/src/lib/supabase';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, setUser } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show shell on auth pages
  const isAuthPage = location.pathname.startsWith('/auth');
  // Hide bottom nav on logger page for full focus
  const isLoggerPage = location.pathname === '/logger';

  if (isAuthPage) {
    return <div className="app-container">{children}</div>;
  }

  return (
    <div className="app-container">
      {/* Status Bar (Mock) */}
      <div className="h-10 px-6 flex justify-between items-center text-[12px] font-semibold shrink-0">
        <span>9:41</span>
        <div className="flex gap-2">
          <span>LTE</span>
          <span>100%</span>
        </div>
      </div>

      {/* Header - Hidden on Logger */}
      {!isLoggerPage && (
        <header className="h-[56px] px-6 flex justify-between items-center shrink-0 border-b border-gray-100">
          <h1 className="text-[20px] font-black text-accent">SpendWise.</h1>
          <div className="flex items-center gap-4">
            <NotificationIcon size={22} hasDot className="text-text-secondary" />
            <div className="w-9 h-9 bg-bg-elevated rounded-full flex items-center justify-center border border-gray-200 text-[12px] font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isLoggerPage && (
        <nav className="absolute bottom-0 w-full h-[72px] bg-white border-t border-gray-100 flex justify-around items-center pb-4 z-40">
          <NavTab to="/dashboard" icon={<HomeIcon size={22} />} label="Home" />
          <NavTab to="/history" icon={<HistoryIcon size={22} />} label="History" />
          
          {/* Central Plus Button */}
          <button 
            onClick={() => navigate('/logger')}
            className="relative -mt-10 active:scale-90 transition-transform"
          >
            <PlusCircleIcon size={56} className="text-accent shadow-lg rounded-full border-4 border-white" />
          </button>

          <NavTab to="/goals" icon={<GoalsIcon size={22} />} label="Goals" />
          <NavTab to="/alerts" icon={<AlertsIcon size={22} />} label="Alerts" />
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
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
          {isActive && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -bottom-2 w-[3px] h-[3px] bg-accent rounded-full"
            />
          )}
        </>
      )}
    </NavLink>
  );
}
