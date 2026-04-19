import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/src/components/ui/Button';
import { CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { formatNaira } from '@/src/lib/utils';
import { ShareIcon, CloseIcon, FlameIcon } from '@/src/components/ui/icons';

interface ShareableSummaryProps {
  data: {
    total_spent: number;
    spend_by_category: Record<string, number>;
    streak_count: number;
    [key: string]: unknown;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  onClose: () => void;
}

export function ShareableSummaryCard({ data, user, onClose }: ShareableSummaryProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const topCategories = Object.entries(data.spend_by_category)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, amount]) => {
      const category = CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
      return { id, amount: amount, category };
    });

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

      if (!blob) throw new Error('Failed to create image');

      const file = new File([blob], `spendwise-summary-${monthName}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My SpendWise Summary',
          text: 'Check out my financial progress this month on SpendWise!',
          files: [file]
        });
      } else {
        // Fallback: Download
        const link = document.createElement('a');
        link.download = `spendwise-summary-${monthName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (e) {
      console.error('Error sharing', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-[8px] z-50 flex flex-col items-center justify-center p-[16px]">
      <button
        onClick={onClose}
        className="absolute top-[24px] right-[24px] p-[8px] bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-20"
        aria-label="Close summary card"
      >
        <CloseIcon size={24} />
      </button>

      <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-[16px]">
        <div
          ref={cardRef}
          className="w-[390px] h-[600px] shrink-0 bg-[var(--color-text-primary)] text-white flex flex-col items-center justify-between p-[32px] relative overflow-hidden rounded-[24px]"
          style={{ transform: 'scale(0.85)', transformOrigin: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
        >
          {/* Background decoration */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[var(--color-accent)] rounded-full opacity-20 blur-[100px] pointer-events-none" />

          <div className="relative z-10 w-full flex justify-between items-start mt-[16px]">
            <h2 className="text-[24px] font-bold font-display tracking-tight text-[var(--color-accent)]">SpendWise.</h2>
            <div className="text-right">
              <p className="text-[14px] text-white/60 font-[500] uppercase tracking-widest">{monthName}</p>
            </div>
          </div>

          <div className="relative z-10 w-full text-center space-y-[8px] my-[24px]">
            <p className="text-[14px] uppercase tracking-widest text-white/60 font-[600]">Total Spent</p>
            <p className="text-[48px] font-bold font-display leading-none text-[var(--color-accent)]">{formatNaira(data.total_spent)}</p>
          </div>

          <div className="relative z-10 w-full space-y-[16px] flex-1">
            <p className="text-[13px] uppercase tracking-widest text-white/60 font-bold border-b border-white/10 pb-[8px]">Top Categories</p>
            <div className="space-y-[12px]">
              {topCategories.map((item) => {
                const Icon = item.category.Icon;
                return (
                  <div key={item.id} className="flex items-center gap-[16px]">
                    <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center font-bold text-[18px]" style={{ color: item.category.color, backgroundColor: `color-mix(in srgb, ${item.category.color} 15%, transparent)` }}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[15px]">{item.category.label}</p>
                    </div>
                    <p className="font-bold font-display text-[16px]">{formatNaira(item.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 w-full flex justify-between items-end mt-[16px] pt-[24px] border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-[11px] text-white/40 uppercase tracking-widest font-[500]">Powered by</span>
              <span className="text-[14px] font-bold text-white/60">SpendWise</span>
            </div>
            {data.streak_count >= 3 && (
              <div className="bg-[rgba(230,176,15,0.15)] text-[var(--color-warning)] px-[12px] py-[6px] rounded-full font-bold text-[12px] flex items-center gap-[6px] border border-[rgba(230,176,15,0.3)]">
                <FlameIcon size={14} /> {data.streak_count} Day Streak!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[390px] shrink-0 pb-[32px] pt-[16px]">
        <Button onClick={handleShare} className="w-full" size="lg">
          <ShareIcon size={20} className="mr-[8px]" />
          Share Summary
        </Button>
      </div>
    </div>
  );
}
