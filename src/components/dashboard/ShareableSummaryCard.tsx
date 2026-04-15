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
    name: string;
    email: string;
    monthly_budget: number;
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
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <CloseIcon size={24} />
      </button>

      <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-4">
        <div
          ref={cardRef}
          className="w-[390px] h-[600px] shrink-0 bg-accent text-white flex flex-col items-center justify-between p-10 relative overflow-hidden"
          style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}
        >
          {/* Background decoration */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-accent-dim rounded-full opacity-50 blur-[80px]" />

          <div className="relative z-10 w-full text-center space-y-2 mt-4">
            <h2 className="text-[24px] font-black tracking-tight">{monthName}</h2>
            <p className="text-[16px] text-white/80 font-medium">My SpendWise Summary</p>
          </div>

          <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-radius-xl p-8 flex flex-col items-center justify-center space-y-2">
            <p className="text-[14px] uppercase tracking-widest text-white/80 font-bold">Total Spent</p>
            <p className="text-[48px] font-black leading-none">{formatNaira(data.total_spent).replace('NGN', '₦')}</p>
          </div>

          <div className="relative z-10 w-full space-y-4">
            <p className="text-[14px] uppercase tracking-widest text-white/80 font-bold text-center">Top Categories</p>
            <div className="space-y-3">
              {topCategories.map((item, index) => {
                const Icon = item.category.Icon;
                return (
                  <div key={item.id} className="flex items-center gap-4 bg-black/20 rounded-radius-lg p-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[18px]" style={{ color: item.category.color, backgroundColor: 'white' }}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[16px]">{item.category.label}</p>
                    </div>
                    <p className="font-black text-[16px]">{formatNaira(item.amount).replace('NGN', '₦')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 w-full flex justify-between items-end mt-4">
            <div className="flex flex-col">
              <span className="text-[12px] text-white/60 uppercase tracking-widest font-bold">Tracked by</span>
              <span className="text-[20px] font-black">SpendWise.</span>
            </div>
            {data.streak_count >= 3 && (
              <div className="bg-white text-accent px-4 py-2 rounded-full font-black text-[14px] flex items-center gap-1.5">
                <FlameIcon size={16} /> {data.streak_count} Day Streak!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[390px] shrink-0 pb-8">
        <Button onClick={handleShare} className="w-full h-14 text-[16px] gap-2">
          <ShareIcon size={20} />
          Share Summary
        </Button>
      </div>
    </div>
  );
}
