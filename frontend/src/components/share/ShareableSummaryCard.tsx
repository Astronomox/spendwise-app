// src/components/share/ShareableSummaryCard.tsx
//
// Receipt-style share card. Modelled on Opay / Moniepoint payment receipts:
//   • cream "thermal-printer" paper on a dark sheet
//   • scalloped zigzag edges (top + bottom)
//   • success checkmark + status header
//   • dotted-leader itemised rows ("FOOD ............ ₦24,500.00")
//   • dashed section dividers
//   • monospace reference number (SW-WK47-A8FK29X)
//   • CSS barcode strip
//   • brand footer
//
// Image generation: html2canvas → PNG, attached to navigator.share via the
// Web Share Level 2 `files` field. Falls back to download + WhatsApp web link
// when files-share isn't supported (mostly desktop browsers).

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Share2, Check, Copy, Download, Loader2, MessageCircle,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { getCategoryById } from '@/lib/categories';
import type { DashboardData } from '@/types/user';
import type { Goal } from '@/types/goals';

// ─────────────────────────────────────────────────────────────────────────────

interface ShareableSummaryCardProps {
  isOpen:   boolean;
  onClose:  () => void;
  data:     DashboardData;
  goals:    Goal[];
  userName: string;
}

/** Generate a deterministic-looking reference number per render. */
function buildRef(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const week = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86_400_000 +
      new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7,
  );
  const rand = Array.from({ length: 8 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
  ).join('');
  return `SW${year}W${week.toString().padStart(2, '0')}-${rand}`;
}

/** Canvas-friendly two-decimal naira (₦96,400.00). Receipts always show kobo. */
function formatNairaPrecise(n: number): string {
  return '₦' + n.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function ShareableSummaryCard({
  isOpen,
  onClose,
  data,
  goals,
  userName,
}: ShareableSummaryCardProps): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Stable per-open values so the receipt doesn't flicker between renders.
  const refNumber = useMemo(buildRef, [isOpen]);
  const now = useMemo(() => new Date(), [isOpen]);

  const dateStr = now.toLocaleDateString('en-NG', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-NG', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const monthName = now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  // Top categories (max 4 line-items keeps the receipt aspect ratio sane).
  const topCats = Object.entries(data.spendByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([id, amount]) => ({ ...getCategoryById(id), amount }));

  const budgetPct = data.monthlyBudget > 0
    ? Math.round((data.totalSpent / data.monthlyBudget) * 100)
    : 0;
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  // ─── Image generation ────────────────────────────────────────────────────

  useEffect(() => {
    // Auto-generate the moment the sheet opens. Wait two RAFs so the card has
    // mounted + laid out before html2canvas snapshots it.
    if (!isOpen) {
      setImageUrl(null);
      setShareError(null);
      return;
    }
    let cancelled = false;
    requestAnimationFrame(() => requestAnimationFrame(async () => {
      if (cancelled || !cardRef.current) return;
      setGenerating(true);
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,   // transparent → preserves shadow/scallops
          scale: 2,                // retina
          useCORS: true,
          logging: false,
        });
        if (!cancelled) setImageUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        if (!cancelled) setShareError('Could not generate image. Text share will still work.');
        // eslint-disable-next-line no-console
        console.warn('[ShareableSummaryCard] html2canvas failed', e);
      } finally {
        if (!cancelled) setGenerating(false);
      }
    }));
    return () => { cancelled = true; };
  }, [isOpen, refNumber]);

  // ─── Share / download ────────────────────────────────────────────────────

  const buildShareText = (): string => {
    const lines: string[] = [];
    lines.push(`💰 ${userName}'s SpendWise Recap — ${monthName}`);
    lines.push('');
    lines.push(`Total Spent: ${formatNaira(data.totalSpent)}`);
    if (data.monthlyBudget > 0) lines.push(`Budget Used: ${budgetPct}%`);
    if (totalSaved > 0) {
      lines.push(`Saved: ${formatNaira(totalSaved)}${completedGoals > 0 ? ` (${completedGoals} goal${completedGoals > 1 ? 's' : ''} hit 🎯)` : ''}`);
    }
    lines.push('');
    lines.push(`Ref: ${refNumber}`);
    lines.push(`Track every naira → spendwise.ng 🇳🇬`);
    return lines.join('\n');
  };

  const downloadImage = (): void => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `spendwise-receipt-${refNumber}.png`;
    a.click();
  };

  /** Best-effort: copy image to clipboard, fall back to copying text. */
  const handleCopy = async (): Promise<void> => {
    try {
      if (imageUrl && 'ClipboardItem' in window && navigator.clipboard?.write) {
        const blob = await (await fetch(imageUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      } else {
        await navigator.clipboard.writeText(buildShareText());
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(buildShareText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* clipboard blocked */ }
    }
  };

  /** Native share with image attached when supported. */
  const handleNativeShare = async (): Promise<void> => {
    setShareError(null);
    try {
      if (imageUrl && navigator.share) {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], `spendwise-receipt-${refNumber}.png`, {
          type: 'image/png',
        });
        // canShare returns false if files aren't supported (e.g. desktop Chrome).
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${userName}'s SpendWise Recap`,
            text:  buildShareText(),
            files: [file],
          });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({
          title: `${userName}'s SpendWise Recap`,
          text:  buildShareText(),
        });
        return;
      }
      handleWhatsAppShare();
    } catch (err) {
      // AbortError = user cancelled, suppress.
      if ((err as DOMException)?.name !== 'AbortError') {
        setShareError('Share failed — try Save Image and send manually.');
      }
    }
  };

  /** WhatsApp web fallback: opens chooser with text only (WA can't accept image via URL). */
  const handleWhatsAppShare = (): void => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  };

  // ─── Receipt body ────────────────────────────────────────────────────────

  const ReceiptRow = ({ label, value, mono = false }: {
    label: string; value: string; mono?: boolean;
  }): React.JSX.Element => (
    <div className="flex items-baseline gap-2 text-[12px]">
      <span className="text-[#3a322a] font-semibold uppercase tracking-[0.04em] whitespace-nowrap">
        {label}
      </span>
      <span
        className="flex-1 self-end translate-y-[-2px] overflow-hidden whitespace-nowrap text-[#7a6f5e]"
        aria-hidden="true"
      >
        ··············································································
      </span>
      <span className={`text-[#0c0a08] font-bold whitespace-nowrap ${mono ? 'font-mono tracking-tight' : ''}`}>
        {value}
      </span>
    </div>
  );

  const Dashed = (): React.JSX.Element => (
    <div className="my-3 border-t border-dashed border-[#1a120c]/25" />
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 bg-forge-surface rounded-t-3xl z-50 max-h-[94vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-9 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 pb-4 border-b border-white/[0.06] shrink-0">
              <div>
                <h2 className="text-[17px] font-extrabold text-cream font-display leading-none">
                  Share Receipt
                </h2>
                <p className="text-[11px] text-cream/45 mt-1">
                  Sent as image · numbers stay your business
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-cream/45 hover:text-cream transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {/* Receipt — captured by html2canvas */}
              <div className="relative mx-auto" style={{ maxWidth: 360 }}>
                {/* Drop shadow behind paper */}
                <div className="absolute inset-x-3 top-3 bottom-3 bg-black/60 blur-2xl rounded-3xl" />

                <div
                  ref={cardRef}
                  className="relative"
                  style={{
                    /* The wrapper holds the scallop edges; the paper sits inside */
                    filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.55))',
                  }}
                >
                  {/* Scalloped top edge */}
                  <Scallop position="top" />

                  {/* Paper body */}
                  <div
                    className="relative px-7 pt-5 pb-6"
                    style={{
                      background:
                        'linear-gradient(180deg, #FBF7EF 0%, #F4EEDF 100%)',
                      backgroundImage: `
                        linear-gradient(180deg, #FBF7EF 0%, #F4EEDF 100%),
                        repeating-linear-gradient(
                          0deg,
                          rgba(60,40,20,0.025) 0px,
                          rgba(60,40,20,0.025) 1px,
                          transparent 1px,
                          transparent 3px
                        )
                      `,
                      backgroundBlendMode: 'multiply',
                    }}
                  >
                    {/* Brand strip */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ background: '#1A0C06' }}
                        >
                          <span className="text-[11px] font-black text-[#D4541A] font-display">SW</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black tracking-[0.18em] text-[#1A0C06] leading-none">
                            SPENDWISE
                          </p>
                          <p className="text-[8px] tracking-[0.12em] text-[#7a6f5e] mt-[2px] uppercase">
                            Money tracker · NG
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-[8.5px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] rounded-sm"
                        style={{ background: '#1A0C06', color: '#D4541A' }}
                      >
                        Verified
                      </span>
                    </div>

                    {/* Success header */}
                    <div className="flex flex-col items-center text-center pt-1 pb-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                        style={{
                          background: 'radial-gradient(circle at 30% 30%, #E8651F, #B7410E)',
                          boxShadow: '0 4px 14px rgba(183,65,14,0.35), inset 0 -2px 4px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Check size={26} strokeWidth={3.5} className="text-white" />
                      </div>
                      <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#B7410E]">
                        Weekly Recap
                      </p>
                      <p className="text-[15px] font-bold text-[#1a120c] mt-1">
                        {userName}'s Spending Summary
                      </p>
                    </div>

                    <Dashed />

                    {/* Big amount */}
                    <div className="text-center py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a6f5e]">
                        Total Spent
                      </p>
                      <p
                        className="font-display font-black text-[34px] text-[#0c0a08] tracking-tight leading-none mt-1"
                      >
                        {formatNairaPrecise(data.totalSpent)}
                      </p>
                      <p className="text-[10px] text-[#7a6f5e] mt-2">
                        {dateStr}  ·  {timeStr}
                      </p>
                    </div>

                    <Dashed />

                    {/* Itemised list */}
                    {topCats.length > 0 && (
                      <>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#7a6f5e] mb-2">
                          Spend Breakdown
                        </p>
                        <div className="space-y-[7px]">
                          {topCats.map(cat => (
                            <ReceiptRow
                              key={cat.id}
                              label={cat.label}
                              value={formatNairaPrecise(cat.amount)}
                              mono
                            />
                          ))}
                        </div>
                        <Dashed />
                      </>
                    )}

                    {/* Stats */}
                    <div className="space-y-[7px]">
                      {data.monthlyBudget > 0 && (
                        <ReceiptRow
                          label="Budget Used"
                          value={`${budgetPct}% of ${formatNaira(data.monthlyBudget)}`}
                          mono
                        />
                      )}
                      <ReceiptRow
                        label="Daily Burn"
                        value={`${formatNaira(data.dailyBurnRate)}/day`}
                        mono
                      />
                      {totalSaved > 0 && (
                        <ReceiptRow
                          label="Total Saved"
                          value={formatNairaPrecise(totalSaved)}
                          mono
                        />
                      )}
                      {completedGoals > 0 && (
                        <ReceiptRow
                          label="Goals Hit"
                          value={`${completedGoals} 🎯`}
                        />
                      )}
                    </div>

                    <Dashed />

                    {/* Reference */}
                    <div className="space-y-1">
                      <ReceiptRow label="Reference"   value={refNumber} mono />
                      <ReceiptRow label="Status"      value="CONFIRMED" />
                      <ReceiptRow label="Account"     value={`@${userName.toLowerCase().replace(/\s+/g, '')}`} mono />
                    </div>

                    {/* Barcode */}
                    <div className="mt-5 mb-2 flex flex-col items-center gap-1">
                      <Barcode seed={refNumber} />
                      <p className="text-[9px] font-mono tracking-[0.12em] text-[#1a120c]">
                        *{refNumber}*
                      </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-[#7a6f5e] mt-3 leading-relaxed">
                      Thanks for staying disciplined.<br />
                      <span className="font-bold text-[#1a120c]">spendwise.ng</span> · Track every naira 🇳🇬
                    </p>
                  </div>

                  {/* Scalloped bottom edge */}
                  <Scallop position="bottom" />
                </div>
              </div>

              {/* Status line */}
              <div className="mt-5 mb-4 text-center min-h-[16px]">
                {generating ? (
                  <p className="text-[11px] text-cream/45 inline-flex items-center gap-1.5">
                    <Loader2 size={11} className="animate-spin" />
                    Rendering high-res image…
                  </p>
                ) : imageUrl ? (
                  <p className="text-[11px] text-success/80 inline-flex items-center gap-1.5">
                    <Check size={11} /> Image ready · 1080 × 1920
                  </p>
                ) : shareError ? (
                  <p className="text-[11px] text-warning/80">{shareError}</p>
                ) : null}
              </div>

              {/* Primary share */}
              <button
                onClick={handleNativeShare}
                disabled={generating}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl font-bold text-[14px] transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(37,211,102,0.30)',
                }}
              >
                <MessageCircle size={16} fill="white" /> Share to WhatsApp
              </button>

              {/* Secondary actions */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <SecondaryBtn
                  icon={copied ? <Check size={13} /> : <Copy size={13} />}
                  label={copied ? 'Copied' : 'Copy'}
                  onClick={handleCopy}
                  active={copied}
                />
                <SecondaryBtn
                  icon={<Download size={13} />}
                  label="Save"
                  onClick={downloadImage}
                  disabled={!imageUrl}
                />
                <SecondaryBtn
                  icon={<Share2 size={13} />}
                  label="More"
                  onClick={handleNativeShare}
                  disabled={generating}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Auxiliary components ────────────────────────────────────────────────────

/** Scalloped paper edge — receipt-like zigzag/circle cuts. */
function Scallop({ position }: { position: 'top' | 'bottom' }): React.JSX.Element {
  // 12 half-circles cut out of the paper.
  return (
    <div
      className="block"
      style={{
        height: 10,
        background: position === 'top'
          ? 'linear-gradient(180deg, #FBF7EF, #FBF7EF)'
          : 'linear-gradient(180deg, #F4EEDF, #F4EEDF)',
        WebkitMaskImage: `radial-gradient(circle 6px at 6px ${position === 'top' ? '0' : '10px'}, transparent 6px, black 6.5px)`,
        WebkitMaskSize: '12px 10px',
        WebkitMaskRepeat: 'repeat-x',
        maskImage: `radial-gradient(circle 6px at 6px ${position === 'top' ? '0' : '10px'}, transparent 6px, black 6.5px)`,
        maskSize: '12px 10px',
        maskRepeat: 'repeat-x',
      }}
    />
  );
}

/** Pseudo-barcode: variable-width vertical bars seeded by the ref number. */
function Barcode({ seed }: { seed: string }): React.JSX.Element {
  // Deterministic widths from char codes
  const bars = useMemo(() => {
    const arr: { w: number; gap: number }[] = [];
    for (let i = 0; i < seed.length * 3; i++) {
      const c = seed.charCodeAt(i % seed.length) + i;
      arr.push({
        w:   1 + (c % 3),       // 1–3 px
        gap: 1 + ((c >> 2) % 2) // 1–2 px
      });
    }
    return arr;
  }, [seed]);
  return (
    <div className="flex items-end gap-0 h-9 px-1">
      {bars.map((b, i) => (
        <div key={i} className="flex items-end" style={{ marginRight: b.gap }}>
          <div style={{ width: b.w, height: '100%', background: '#1a120c' }} />
        </div>
      ))}
    </div>
  );
}

/** Compact secondary action button used in the 3-col grid. */
function SecondaryBtn({
  icon, label, onClick, active = false, disabled = false,
}: {
  icon:      React.ReactNode;
  label:     string;
  onClick:   () => void;
  active?:   boolean;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 flex items-center justify-center gap-1.5 rounded-2xl text-[12px] font-bold transition-all
        ${active
          ? 'bg-success/15 border border-success/30 text-success'
          : 'bg-forge-elevated border border-white/[0.06] text-cream/60 hover:text-cream hover:border-white/[0.12]'
        }
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      {icon} {label}
    </button>
  );
}
