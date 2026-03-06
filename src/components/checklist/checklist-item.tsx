"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/lib/haptics";

const HOLD_DURATION = 600; // ms
const BUZZ_INTERVAL = 80; // ms between buzz pulses

interface ChecklistItemProps {
  habit: { id: string; name: string; emoji: string | null };
  completed: boolean;
  onToggle: (habitId: string, completed: boolean) => void;
}

export function ChecklistItem({
  habit,
  completed,
  onToggle,
}: ChecklistItemProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdStartRef = useRef(0);
  const rafRef = useRef(0);
  const buzzIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const completedRef = useRef(false);
  const haptics = useHaptics();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(buzzIntervalRef.current);
    };
  }, []);

  const startHold = useCallback(
    (e: React.PointerEvent) => {
      if (completed) return;
      e.preventDefault();

      setIsHolding(true);
      completedRef.current = false;
      holdStartRef.current = Date.now();

      // Start buzz haptic loop
      haptics.buzz();
      buzzIntervalRef.current = setInterval(() => {
        haptics.buzz();
      }, BUZZ_INTERVAL);

      // Animate fill
      const animate = () => {
        const elapsed = Date.now() - holdStartRef.current;
        const progress = Math.min(elapsed / HOLD_DURATION, 1);
        setHoldProgress(progress);

        if (progress >= 1) {
          clearInterval(buzzIntervalRef.current);
          completedRef.current = true;
          haptics.checkHabit();
          onToggle(habit.id, true);
          setIsHolding(false);
          setHoldProgress(0);
          return;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [completed, habit.id, haptics, onToggle]
  );

  const cancelHold = useCallback(() => {
    if (!isHolding) return;

    cancelAnimationFrame(rafRef.current);
    clearInterval(buzzIntervalRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  }, [isHolding]);

  const handlePointerUp = useCallback(() => {
    cancelHold();
    // Tap to uncheck
    if (completed) {
      haptics.uncheckHabit();
      onToggle(habit.id, false);
    }
  }, [cancelHold, completed, habit.id, haptics, onToggle]);

  return (
    <motion.div
      layout
      className="relative overflow-hidden flex items-center gap-4 px-5 py-4 bg-surface rounded-2xl shadow-sm select-none touch-manipulation cursor-pointer"
      animate={{ opacity: completed ? 0.6 : 1 }}
      transition={{ duration: 0.2 }}
      onPointerDown={startHold}
      onPointerUp={handlePointerUp}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Hold progress fill */}
      {isHolding && (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "oklch(0.92 0.08 155)",
            width: `${holdProgress * 100}%`,
            transition: "none",
          }}
        />
      )}

      {/* Check indicator */}
      <div className="relative z-10 shrink-0">
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="checked"
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.72 0.19 155)" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                />
              </motion.svg>
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              className="w-7 h-7 rounded-lg border-2 border-gray-300"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0 relative z-10">
        {habit.emoji && (
          <span className="text-xl shrink-0">{habit.emoji}</span>
        )}
        <span
          className={`text-base font-medium transition-all duration-200 truncate ${
            completed
              ? "line-through text-muted decoration-muted/40"
              : "text-foreground"
          }`}
        >
          {habit.name}
        </span>
      </div>

      {/* Hold hint for uncompleted items */}
      {!completed && !isHolding && (
        <span className="relative z-10 text-[10px] text-muted/50 shrink-0">
          hold
        </span>
      )}
    </motion.div>
  );
}
