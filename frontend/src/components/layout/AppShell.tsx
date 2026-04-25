import { useLocation, useNavigate, NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Clock, Target, Bell, Plus, LogOut, MessageSquare, type LucideIcon } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useAlerts } from '@/hooks/useAlerts';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/sms-queue', icon: MessageSquare, label: 'SMS Queue' },
] as const;

function SidebarTab({ to, icon: Icon, label, badge = 0 }: NavItem & { badge?: number }): React.JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 h-11 px-3.5 rounded-xl',
        'border-l-2 font-semibold text-sm transition-all duration-150',
        isActive
          ? 'bg-rust/10 text-rust border-rust'
          : 'text-cream/55 hover:bg-white/[0.04] hover:text-cream border-transparent'
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
      {badge > 0 && (
        <span className="ml-auto text-[10px] font-bold min-w-[18px] h-[18px] bg-danger text-white rounded-full flex items-center justify-center px-1">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
}

function BottomTab({ to, icon: Icon, label }: NavItem): React.JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex-1 flex flex-col items-center gap-1 pt-2 pb-1 relative',
        'text-[10px] font-bold uppercase tracking-wide transition-colors',
        isActive ? 'text-rust' : 'text-cream/30 hover:text-cream/55'
      )}
    >
      {({ isActive }) => (
        <>
          <Icon size={21} />
          <span>{label}</span>
          {isActive && (
            <motion.div
              layoutId="bottom-indicator"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rust"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AppShell(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const clearUser = useAppStore((s) => s.clearUser);
  const { alerts } = useAlerts();

  const isLogger = location.pathname === '/logger';
  const unread = alerts.filter(a => !a.read).length;
  const fullName = user?.fullName ?? 'User';
  const initials = getInitials(fullName);

  return (
    <div className="flex min-h-screen w-full bg-forge-bg">
      {/* Desktop Sidebar */}
      {!isLogger && (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col z-50 py-6 bg-forge-surface border-r border-white/[0.06]">
          <div className="px-6 mb-10">
            <h1 className="text-[20px] font-black font-display text-gradient-rust tracking-tight">SpendWise.</h1>
          </div>
          <nav className="flex-1 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map(item => (
              <SidebarTab key={item.to} {...item} badge={item.to === '/alerts' ? unread : 0} />
            ))}
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <button onClick={() => navigate('/logger')} className="w-full h-12 rounded-xl bg-rust-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-rust hover:shadow-rust-lg active:scale-[0.98] transition-all">
                <Plus size={18} /> Log Expense
              </button>
            </div>
          </nav>
          <div className="px-3">
            <div className="p-3 bg-forge-elevated rounded-2xl border border-white/[0.06] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rust/20 border border-rust/30 flex items-center justify-center text-[11px] font-bold text-rust flex-shrink-0">{initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-cream truncate">{fullName}</p>
                <button onClick={() => { clearUser(); navigate('/auth/login'); }} className="flex items-center gap-1 text-[11px] font-semibold text-cream/30 hover:text-danger transition-colors">
                  <LogOut size={11} /> Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={cn('flex-1 flex flex-col w-full', !isLogger && 'lg:ml-60')}>
        {!isLogger && (
          <header className="lg:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-forge-bg/90 backdrop-blur-md border-b border-white/[0.06]">
            <h1 className="text-[19px] font-black font-display text-gradient-rust">SpendWise.</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/alerts')} className="relative text-cream/55 hover:text-cream transition-colors">
                <Bell size={22} />
                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full border-2 border-forge-bg" />}
              </button>
              <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-rust/20 border border-rust/30 flex items-center justify-center text-[11px] font-bold text-rust">{initials}</button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className={cn('max-w-[1100px] mx-auto', !isLogger && 'px-4 pb-24 lg:px-12 lg:pb-16')}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      {!isLogger && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center glass border-t border-white/[0.06] h-[64px]">
          <BottomTab to="/dashboard" icon={Home} label="Home" />
          <BottomTab to="/history" icon={Clock} label="History" />
          <div className="flex-1 flex justify-center">
            <button onClick={() => navigate('/logger')} className="w-[52px] h-[52px] -mt-5 rounded-full bg-rust-gradient text-white flex items-center justify-center shadow-rust active:scale-95 transition-transform">
              <Plus size={22} />
            </button>
          </div>
          <BottomTab to="/goals" icon={Target} label="Goals" />
          <BottomTab to="/alerts" icon={Bell} label="Alerts" />
        </nav>
      )}
    </div>
  );
}