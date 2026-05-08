// src/pages/Profile.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Wallet,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Pencil,
  Check,
  X,
  Info,
  MessageSquare,
  Download,
  Smartphone,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatNaira } from '@/lib/utils';
import { useToastStore } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// ── Animation variants ───

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ── Menu row ───

interface MenuRowProps {
  icon:    React.ReactNode;
  label:   string;
  detail?: string;
  danger?: boolean;
  badge?:  string;
  onClick: () => void;
}

function MenuRow({ icon, label, detail, danger = false, badge, onClick }: MenuRowProps): React.JSX.Element {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-5 py-4
        border-b border-white/[0.04] last:border-b-0
        transition-colors duration-150
        ${danger ? 'hover:bg-[#F43F5E]/[0.06]' : 'hover:bg-white/[0.03]'}
      `}
    >
      <div
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${danger ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-rust/10 text-rust'}
        `}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className={`text-[15px] font-semibold ${danger ? 'text-[#F43F5E]' : 'text-cream'}`}>
            {label}
          </p>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-success/15 text-success rounded-full border border-success/25">
              {badge}
            </span>
          )}
        </div>
        {detail != null && (
          <p className="text-[12px] text-cream/30 mt-0.5">{detail}</p>
        )}
      </div>
      {!danger && <ChevronRight size={18} className="text-cream/20" />}
    </motion.button>
  );
}

// ── Profile page ───

export default function Profile(): React.JSX.Element {
  const navigate  = useNavigate();
  const user      = useAppStore((s) => s.user);
  const clearUser = useAppStore((s) => s.clearUser);
  const addToast  = useToastStore((s) => s.addToast);

  const storedBudget = localStorage.getItem('sw_budget');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue,     setBudgetValue]     = useState(
    storedBudget ?? user?.monthlyBudget?.toString() ?? '150000'
  );

  const [smsEnabled, setSmsEnabled] = useState(() => {
    return localStorage.getItem('sw_sms_enabled') !== 'false';
  });

  const displayName   = user?.fullName ?? 'SpendWise User';
  const displayEmail  = user?.email    ?? 'user@spendwise.ng';
  const initial       = displayName.charAt(0).toUpperCase();
  const monthlyBudget = Number(budgetValue) || 0;

  const handleLogout = (): void => {
    clearUser();
    navigate('/auth/login', { replace: true });
  };

  const handleBudgetSave = (): void => {
    localStorage.setItem('sw_budget', budgetValue);
    setIsEditingBudget(false);
    addToast('Budget updated!', 'success');
  };

  const toggleSms = (): void => {
    const newVal = !smsEnabled;
    setSmsEnabled(newVal);
    localStorage.setItem('sw_sms_enabled', String(newVal));
    addToast(newVal ? 'SMS tracking enabled' : 'SMS tracking disabled', 'success');
  };

  const handleExportData = (): void => {
    try {
      const data = {
        goals:        JSON.parse(localStorage.getItem('sw_goals') ?? '[]'),
        alerts:       JSON.parse(localStorage.getItem('sw_alerts') ?? '[]'),
        budget:       localStorage.getItem('sw_budget'),
        exportedAt:   new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spendwise-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Data exported!', 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="pt-6 pb-12 max-w-lg mx-auto"
    >
      {/* Avatar + identity */}
      <motion.div variants={fadeUp} className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rust to-rust-dim flex items-center justify-center shadow-[0_8px_40px_rgba(183,65,14,0.25)] mb-5"
        >
          <span className="text-[40px] font-extrabold font-display text-cream tracking-tight">
            {initial}
          </span>
        </motion.div>

        <h1 className="text-[24px] font-extrabold font-display text-cream tracking-tight">
          {displayName}
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Mail size={14} className="text-cream/30" />
          <p className="text-[14px] text-cream/40">{displayEmail}</p>
        </div>
      </motion.div>

      {/* Monthly budget card */}
      <motion.div variants={fadeUp} className="mb-6">
        <Card variant="accent" className="p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-rust" />
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/40">
                Monthly Budget
              </p>
            </div>
            {!isEditingBudget ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsEditingBudget(true)}
                className="flex items-center gap-1 text-rust text-[12px] font-bold hover:text-rust-light transition-colors"
              >
                <Pencil size={13} /> Edit
              </motion.button>
            ) : (
              <div className="flex items-center gap-1">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBudgetSave}
                  className="p-1.5 rounded-lg bg-[#2DB37A]/15 text-[#2DB37A] hover:bg-[#2DB37A]/25 transition-colors"
                >
                  <Check size={14} />
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setBudgetValue(storedBudget ?? user?.monthlyBudget?.toString() ?? '150000');
                    setIsEditingBudget(false);
                  }}
                  className="p-1.5 rounded-lg bg-[#F43F5E]/15 text-[#F43F5E] hover:bg-[#F43F5E]/25 transition-colors"
                >
                  <X size={14} />
                </motion.button>
              </div>
            )}
          </div>

          {isEditingBudget ? (
            <div className="mt-3">
              <Input
                type="number"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                placeholder="e.g., 150000"
              />
            </div>
          ) : (
            <p className="text-[28px] font-extrabold font-display text-cream tracking-tight mt-1">
              {formatNaira(monthlyBudget)}
            </p>
          )}
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div variants={fadeUp} className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/30 mb-3 px-1">
          Settings
        </p>
        <Card variant="default" className="overflow-hidden">
          <MenuRow
            icon={<User size={20} />}
            label="Edit Profile"
            detail="Name, email, phone"
            onClick={() => addToast('Profile editing coming soon', 'info')}
          />
          <MenuRow
            icon={<MessageSquare size={20} />}
            label="SMS Tracking"
            detail={smsEnabled ? 'Reading bank SMS alerts' : 'Disabled'}
            badge={smsEnabled ? 'ON' : undefined}
            onClick={toggleSms}
          />
          <MenuRow
            icon={<Bell size={20} />}
            label="Notifications"
            detail="Alerts, budget warnings"
            onClick={() => navigate('/alerts')}
          />
          <MenuRow
            icon={<Shield size={20} />}
            label="Security"
            detail="Password, 2FA"
            onClick={() => addToast('Security settings coming soon', 'info')}
          />
        </Card>
      </motion.div>

      {/* Data */}
      <motion.div variants={fadeUp} className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/30 mb-3 px-1">
          Data
        </p>
        <Card variant="default" className="overflow-hidden">
          <MenuRow
            icon={<Download size={20} />}
            label="Export Data"
            detail="Download your goals and settings"
            onClick={handleExportData}
          />
          <MenuRow
            icon={<Smartphone size={20} />}
            label="SMS Queue"
            detail="Review pending SMS transactions"
            onClick={() => navigate('/sms-queue')}
          />
        </Card>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={fadeUp} className="mb-10">
        <Card variant="default" className="overflow-hidden">
          <MenuRow
            icon={<LogOut size={20} />}
            label="Log Out"
            danger
            onClick={handleLogout}
          />
        </Card>
      </motion.div>

      {/* App info */}
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-1.5 text-cream/20">
          <Info size={14} />
          <p className="text-[12px] font-medium">SpendWise v1.1.0</p>
        </div>
        <p className="text-[11px] text-cream/15">
          Track every naira. Build real wealth.
        </p>
      </motion.div>
    </motion.div>
  );
}
