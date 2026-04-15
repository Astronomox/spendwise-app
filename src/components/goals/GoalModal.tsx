import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { SavingsGoal } from '@/src/types/goals';
import { CloseIcon } from '@/src/components/ui/icons';
import { CATEGORIES } from '@/src/components/logger/CategoryPicker';

interface GoalModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'current_amount'>) => Promise<void>;
}

export function GoalModal({ goal, isOpen, onClose, onSave }: GoalModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORIES[7].id); // savings icon by default
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal && isOpen) {
      setName(goal.name);
      setIcon(goal.icon);
      setTargetAmount(goal.target_amount.toString());
      setDeadline(goal.deadline.split('T')[0]);
    } else if (isOpen) {
      setName('');
      setIcon(CATEGORIES[7].id);
      setTargetAmount('');
      setDeadline('');
    }
  }, [goal, isOpen]);

  const handleSave = async () => {
    if (!name || !targetAmount || !deadline) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name,
        icon,
        target_amount: Number(targetAmount),
        deadline: new Date(deadline).toISOString()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
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
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-radius-xl z-50 h-[90vh] flex flex-col"
          >
            <div className="flex justify-center p-3 shrink-0">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-[18px] font-black">{goal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-text-secondary">
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <Input
                  label="Goal Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., New Laptop"
                />

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">Icon</label>
                  <div className="grid grid-cols-4 gap-3">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.Icon;
                      const isSelected = icon === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setIcon(cat.id)}
                          className={`h-12 flex items-center justify-center rounded-radius-md border ${isSelected ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 text-text-secondary hover:bg-gray-50'}`}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Target Amount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g., 500000"
                />
                <Input
                  label="Target Date"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-danger text-[13px] font-bold text-center">
                  {error}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white pb-10">
              <Button
                className="w-full h-14"
                onClick={handleSave}
                isLoading={isSubmitting}
              >
                {goal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
