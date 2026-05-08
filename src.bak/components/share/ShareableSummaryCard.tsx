// src/components/share/ShareableSummaryCard.tsx
import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Check, Flame, TrendingDown, Image, Loader2 } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { getCategoryById } from '@/lib/categories';
import type { DashboardData } from '@/types/user';
import type { Goal } from '@/types/goals';
import Button from '@/components/ui/Button';

interface ShareableSummaryCardProps {
  isOpen:    boolean;
  onClose:   () => void;
  data:      DashboardData;
  goals:     Goal[];
  userName:  string;
}

export function ShareableSummaryCard({
  isOpen,
  onClose,
  data,
  goals,
  userName,
}: ShareableSummaryCardProps): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const topCats = Object.entries(data.spendByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, amount]) => ({ ...getCategoryById(id), amount }));

  const budgetPct = data.monthlyBudget > 0
    ? Math.round((data.totalSpent / data.monthlyBudget) * 100)
    : 0;

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  const now = new Date();
  const monthName = now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  // ── Text share ──
  const buildShareText = (): string => {
    let text = `💰 ${userName}'s SpendWise Summary — ${monthName}\n\n`;
    text += `📊 Total Spent: ${formatNaira(data.totalSpent)}\n`;
    if (data.monthlyBudget > 0) {
      text += `📋 Budget Used: ${budgetPct}%\n`;
    }
    text += `🔥 Daily Burn Rate: ${formatNaira(data.dailyBurnRate)}\n\n`;

    if (topCats.length > 0) {
      text += `Top Spending:\n`;
      topCats.forEach(cat => {
        text += `  • ${cat.label}: ${formatNaira(cat.amount)}\n`;
      });
      text += '\n';
    }

    if (goals.length > 0) {
      text += `💎 Savings: ${formatNaira(totalSaved)}`;
      if (completedGoals > 0) text += ` (${completedGoals} goal${completedGoals > 1 ? 's' : ''} hit!)`;
      text += '\n\n';
    }

    text += `Track your money with SpendWise 🇳🇬`;
    return text;
  };

  // ── Canvas image generation (no external lib needed) ──
  const generateImage = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0908',
        scale: 2, // retina quality
        useCORS: true,
        logging: false,
      });

      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
    } catch {
      // Fallback: use canvas API to draw a simple card
      await generateFallbackImage();
    } finally {
      setGenerating(false);
    }
  }, [data, topCats, budgetPct, userName, monthName, totalSaved]);

  const generateFallbackImage = async () => {
    const canvas = document.createElement('canvas');
    const w = 600;
    const h = 400;
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1A0C06');
    grad.addColorStop(1, '#0A0908');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = 'rgba(183,65,14,0.3)';
    ctx.lineWidth = 2;
    ctx.roundRect(1, 1, w - 2, h - 2, 16);
    ctx.stroke();

    // Header
    ctx.fillStyle = 'rgba(245,241,235,0.4)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(monthName.toUpperCase(), 32, 40);

    ctx.fillStyle = '#D4541A';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('SpendWise', w - 90, 40);

    // Username
    ctx.fillStyle = 'rgba(245,241,235,0.5)';
    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillText(`${userName}'s Summary`, 32, 62);

    // Total Spent label
    ctx.fillStyle = 'rgba(245,241,235,0.3)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('TOTAL SPENT', 32, 100);

    // Total Spent amount
    ctx.fillStyle = '#F5F1EB';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText(formatNaira(data.totalSpent), 32, 140);

    // Budget bar
    if (data.monthlyBudget > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.roundRect(32, 158, w - 64, 6, 3);
      ctx.fill();

      const barGrad = ctx.createLinearGradient(32, 0, 32 + (w - 64) * (budgetPct / 100), 0);
      barGrad.addColorStop(0, '#D4541A');
      barGrad.addColorStop(1, '#B87333');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(32, 158, (w - 64) * Math.min(1, budgetPct / 100), 6, 3);
      ctx.fill();

      ctx.fillStyle = 'rgba(245,241,235,0.4)';
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillText(`${budgetPct}% of ${formatNaira(data.monthlyBudget)} budget`, 32, 184);
    }

    // Stats row
    const statsY = 220;
    // Burn rate
    ctx.fillStyle = 'rgba(245,241,235,0.3)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('🔥 BURN RATE', 32, statsY);
    ctx.fillStyle = '#F5F1EB';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(`${formatNaira(data.dailyBurnRate)}/day`, 32, statsY + 22);

    // Saved
    ctx.fillStyle = 'rgba(245,241,235,0.3)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('💎 SAVED', w / 2, statsY);
    ctx.fillStyle = '#F5F1EB';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(formatNaira(totalSaved), w / 2, statsY + 22);

    // Top categories
    if (topCats.length > 0) {
      const catY = 290;
      ctx.fillStyle = 'rgba(245,241,235,0.3)';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('TOP SPENDING', 32, catY);

      topCats.forEach((cat, i) => {
        const y = catY + 22 + i * 24;
        ctx.fillStyle = cat.color;
        ctx.beginPath();
        ctx.arc(40, y - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(245,241,235,0.7)';
        ctx.font = '500 12px Inter, sans-serif';
        ctx.fillText(cat.label, 52, y);

        ctx.fillStyle = '#F5F1EB';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(formatNaira(cat.amount), w - 120, y);
      });
    }

    // Footer
    ctx.fillStyle = 'rgba(245,241,235,0.15)';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Track every naira · spendwise.ng 🇳🇬', w / 2, h - 16);
    ctx.textAlign = 'left';

    setImageUrl(canvas.toDataURL('image/png'));
  };

  // ── Download image ──
  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `spendwise-summary-${now.toISOString().split('T')[0]}.png`;
    a.click();
  };

  // ── Share handlers ──
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleNativeShare = async () => {
    // Try sharing image if generated, else text
    if (imageUrl && navigator.share) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'spendwise-summary.png', { type: 'image/png' });
        await navigator.share({
          title: `${userName}'s SpendWise Summary`,
          text: buildShareText(),
          files: [file],
        });
        return;
      } catch { /* fallback to text */ }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s SpendWise Summary`,
          text: buildShareText(),
        });
      } catch { /* cancelled */ }
    } else {
      handleWhatsAppShare();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-forge-surface rounded-t-3xl z-50 max-h-[92vh] flex flex-col"
          >
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-6 pb-4 border-b border-white/[0.06] shrink-0">
              <h2 className="text-[18px] font-bold text-cream font-display">Share Summary</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-cream/40 hover:text-cream transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Summary card preview */}
              <div
                ref={cardRef}
                className="rounded-3xl overflow-hidden border border-rust/20 mb-6"
                style={{ background: 'linear-gradient(135deg, #1A0C06, #0A0908)' }}
              >
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-cream/40">
                      {monthName}
                    </p>
                    <span className="text-[10px] font-bold text-rust-light px-2 py-0.5 bg-rust/15 rounded-full">
                      SpendWise
                    </span>
                  </div>
                  <p className="text-[13px] text-cream/50 font-medium">{userName}'s Summary</p>
                </div>

                <div className="px-6 pb-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/30 mb-1">
                    Total Spent
                  </p>
                  <p className="text-[36px] font-extrabold font-display text-cream tracking-tight leading-none">
                    {formatNaira(data.totalSpent)}
                  </p>
                  {data.monthlyBudget > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-progress-rust"
                          style={{ width: `${Math.min(100, budgetPct)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-cream/40 mt-1.5">{budgetPct}% of {formatNaira(data.monthlyBudget)} budget</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 border-t border-white/[0.06]">
                  <div className="px-6 py-4 border-r border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Flame size={12} className="text-warning" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-cream/30">Burn Rate</p>
                    </div>
                    <p className="text-[16px] font-bold font-display text-cream">{formatNaira(data.dailyBurnRate)}<span className="text-[11px] text-cream/40">/day</span></p>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingDown size={12} className="text-success" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-cream/30">Saved</p>
                    </div>
                    <p className="text-[16px] font-bold font-display text-cream">{formatNaira(totalSaved)}</p>
                  </div>
                </div>

                {topCats.length > 0 && (
                  <div className="px-6 py-4 border-t border-white/[0.06]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-cream/30 mb-3">Top Spending</p>
                    <div className="space-y-2">
                      {topCats.map(cat => {
                        const CatIcon = cat.Icon;
                        const total = Object.values(data.spendByCategory).reduce((s, v) => s + v, 0);
                        const catPct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
                        return (
                          <div key={cat.id} className="flex items-center gap-3">
                            <CatIcon size={14} style={{ color: cat.color }} className="flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-[12px] font-semibold text-cream/70">{cat.label}</span>
                                <span className="text-[12px] font-bold text-cream">{formatNaira(cat.amount)}</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${catPct}%`, backgroundColor: cat.color }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="px-6 py-3 border-t border-white/[0.06] text-center">
                  <p className="text-[10px] text-cream/20 font-medium">
                    Track every naira · spendwise.ng 🇳🇬
                  </p>
                </div>
              </div>

              {/* Generate image button */}
              {!imageUrl && (
                <button
                  onClick={generateImage}
                  disabled={generating}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-forge-elevated border border-white/[0.06] text-cream/60 text-[13px] font-bold hover:text-cream hover:border-white/[0.12] transition-all mb-3 disabled:opacity-40"
                >
                  {generating ? (
                    <><Loader2 size={14} className="animate-spin" /> Generating image...</>
                  ) : (
                    <><Image size={14} /> Generate Shareable Image</>
                  )}
                </button>
              )}

              {/* Image preview */}
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <p className="text-[11px] font-bold text-cream/40 uppercase tracking-widest mb-2">Image Preview</p>
                  <img
                    src={imageUrl}
                    alt="Summary card"
                    className="w-full rounded-2xl border border-white/[0.08]"
                  />
                </motion.div>
              )}

              {/* Share buttons */}
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleWhatsAppShare}>
                  <Share2 size={16} /> Share to WhatsApp
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleCopy}
                    className="h-11 flex items-center justify-center gap-1.5 rounded-2xl bg-forge-elevated border border-white/[0.06] text-cream/60 text-[12px] font-bold hover:text-cream hover:border-white/[0.12] transition-all"
                  >
                    {copied ? <Check size={13} className="text-success" /> : <Download size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  {imageUrl && (
                    <button
                      onClick={downloadImage}
                      className="h-11 flex items-center justify-center gap-1.5 rounded-2xl bg-forge-elevated border border-white/[0.06] text-cream/60 text-[12px] font-bold hover:text-cream hover:border-white/[0.12] transition-all"
                    >
                      <Image size={13} /> Save
                    </button>
                  )}
                  <button
                    onClick={handleNativeShare}
                    className="h-11 flex items-center justify-center gap-1.5 rounded-2xl bg-forge-elevated border border-white/[0.06] text-cream/60 text-[12px] font-bold hover:text-cream hover:border-white/[0.12] transition-all"
                  >
                    <Share2 size={13} /> More
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
