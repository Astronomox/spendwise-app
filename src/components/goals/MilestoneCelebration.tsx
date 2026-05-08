// src/components/goals/MilestoneCelebration.tsx
//
// Full-screen celebration overlay shown when a goal crosses 25/50/75/100%.
// No new dependencies — confetti is hand-rolled with framer-motion particles
// so the whole thing weighs <2 KB at runtime and shares the app's tokens.
//
// Props are deliberately dumb. The owning page decides WHEN to show this;
// `useMilestoneWatcher` (sibling hook) handles the detection + persistence.

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Flame, X } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import type { MilestonePct } from '@/lib/milestones';

interface MilestoneCelebrationProps {
  isOpen:    boolean;
  onClose:   () => void;
  milestone: MilestonePct;
  goalName:  string;
  amount:    number;
  /** When true, renders the "you crushed it" 100% variant instead of progress. */
  isComplete?: boolean;
  /** Optional secondary action — e.g. "Share to WhatsApp". */
  onShare?: () => void;
}

const COPY: Record<MilestonePct, { title: string; sub: string; emoji: string }> = {
  25:  { title: 'Quarter Way There',  sub: "You're building the habit. Keep stacking.",      emoji: '🌱' },
  50:  { title: 'Halfway Hero',       sub: "Halfway done. The hard part is behind you.",      emoji: '🔥' },
  75:  { title: 'Final Stretch',      sub: "Three-quarters of the way. Don't ease up now.",   emoji: '⚡' },
  100: { title: 'Goal Crushed!',      sub: "You did it. Time to celebrate — then set the next one.", emoji: '🏆' },
};

// ─────────────────────────────────────────────────────────────────────────────

export function MilestoneCelebration({
  isOpen,
  onClose,
  milestone,
  goalName,
  amount,
  isComplete = milestone === 100,
  onShare,
}: MilestoneCelebrationProps): React.JSX.Element {
  const copy = COPY[milestone];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{
              background: isComplete
                ? 'radial-gradient(circle at 50% 30%, rgba(45,179,122,0.35), rgba(0,0,0,0.85) 60%)'
                : 'radial-gradient(circle at 50% 30%, rgba(212,84,26,0.30), rgba(0,0,0,0.85) 60%)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
          />

          <Confetti accent={isComplete ? '#2DB37A' : '#D4541A'} />

          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="bg-forge-surface rounded-3xl border border-white/[0.08] shadow-card-lg max-w-sm w-full overflow-hidden pointer-events-auto relative">
              <button
                onClick={onClose}
                aria-label="Dismiss"
                className="absolute top-3 right-3 p-2 text-cream/40 hover:text-cream rounded-xl transition-colors z-10"
                type="button"
              >
                <X size={18} />
              </button>

              {/* Trophy / icon ring */}
              <div className="pt-9 pb-3 flex flex-col items-center">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: isComplete
                        ? 'radial-gradient(circle at 30% 30%, #4FD49B, #2DB37A 70%)'
                        : 'radial-gradient(circle at 30% 30%, #E8651F, #B7410E 70%)',
                      boxShadow: isComplete
                        ? '0 8px 30px rgba(45,179,122,0.45), inset 0 -3px 8px rgba(0,0,0,0.2)'
                        : '0 8px 30px rgba(212,84,26,0.45), inset 0 -3px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {isComplete ? (
                      <Trophy size={36} strokeWidth={2.4} className="text-white" />
                    ) : milestone === 75 ? (
                      <Flame size={34} strokeWidth={2.4} className="text-white" />
                    ) : (
                      <Sparkles size={34} strokeWidth={2.4} className="text-white" />
                    )}
                  </motion.div>

                  {/* Pulsing ring */}
                  <motion.div
                    initial={{ scale: 1,   opacity: 0.5 }}
                    animate={{ scale: 1.6, opacity: 0   }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      borderColor: isComplete ? '#2DB37A' : '#D4541A',
                    }}
                  />
                </div>

                <p
                  className="text-[10px] font-black tracking-[0.22em] uppercase mt-5"
                  style={{ color: isComplete ? '#4FD49B' : '#E8651F' }}
                >
                  {milestone}% Milestone {copy.emoji}
                </p>
              </div>

              {/* Body */}
              <div className="px-7 pb-7 text-center">
                <h2 className="text-[24px] font-black font-display text-cream tracking-tight leading-tight">
                  {copy.title}
                </h2>
                <p className="text-[13px] text-cream/55 mt-2 leading-relaxed">
                  {copy.sub}
                </p>

                {/* Goal pill */}
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-forge-elevated border border-white/[0.06]">
                  <span className="text-[11px] font-bold text-cream/45 uppercase tracking-[0.06em]">
                    {goalName}
                  </span>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="text-[12px] font-extrabold font-display text-cream">
                    {formatNaira(amount)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="flex-1 h-11 rounded-2xl text-[13px] font-bold text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        boxShadow: '0 4px 14px rgba(37,211,102,0.30)',
                      }}
                      type="button"
                    >
                      Brag a little
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className={`${onShare ? 'flex-1' : 'w-full'} h-11 rounded-2xl bg-forge-elevated border border-white/[0.08] text-cream/70 hover:text-cream hover:border-white/[0.18] text-[13px] font-bold transition-all`}
                    type="button"
                  >
                    {isComplete ? 'Set next goal' : 'Keep going'}
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

// ─── Confetti ────────────────────────────────────────────────────────────────

/** Hand-rolled confetti — 36 particles falling from the top with random drift. */
function Confetti({ accent }: { accent: string }): React.JSX.Element {
  const particles = Array.from({ length: 36 }, (_, i) => i);
  const colors = [accent, '#F5F1EB', '#B87333', '#FBBF24', accent];
  return (
    <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
      {particles.map(i => {
        const left  = Math.random() * 100;
        const drift = (Math.random() - 0.5) * 30;
        const delay = Math.random() * 0.4;
        const dur   = 1.6 + Math.random() * 1.2;
        const size  = 6 + Math.random() * 6;
        const rot   = Math.random() * 360;
        const color = colors[i % colors.length];
        const square = i % 3 === 0;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${left}vw`,           opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', x: `${left + drift}vw`, opacity: 0, rotate: rot * 4 }}
            transition={{ duration: dur, delay, ease: [0.2, 0.6, 0.4, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              width:  size,
              height: square ? size : size * 0.4,
              background: color,
              borderRadius: square ? 2 : 4,
            }}
          />
        );
      })}
    </div>
  );
}
