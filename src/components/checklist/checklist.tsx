"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChecklistItem } from "./checklist-item";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useHaptics } from "@/lib/haptics";
import { fireCompletionConfetti } from "@/lib/confetti";
import { createClient } from "@/lib/supabase/client";
import type { Habit, Completion } from "@/types/database";

interface Props {
  habits: Habit[];
  completions: Completion[];
  date: string;
  userId: string;
}

export function Checklist({
  habits,
  completions: initialCompletions,
  date,
  userId,
}: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(initialCompletions.map((c) => c.habit_id))
  );
  const prevAllDone = useRef(false);
  const haptics = useHaptics();
  const supabase = createClient();

  const total = habits.length;
  const done = completedIds.size;
  const allDone = total > 0 && done === total;

  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      haptics.celebrate();
      fireCompletionConfetti();
    }
    prevAllDone.current = allDone;
  }, [allDone, haptics]);

  const handleToggle = useCallback(
    async (habitId: string, checked: boolean) => {
      // Optimistic update
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(habitId);
        else next.delete(habitId);
        return next;
      });

      if (checked) {
        const { error } = await supabase.from("completions").insert({
          user_id: userId,
          habit_id: habitId,
          date,
        });
        if (error) {
          // Revert on failure
          setCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(habitId);
            return next;
          });
        }
      } else {
        const { error } = await supabase
          .from("completions")
          .delete()
          .eq("user_id", userId)
          .eq("habit_id", habitId)
          .eq("date", date);
        if (error) {
          setCompletedIds((prev) => {
            const next = new Set(prev);
            next.add(habitId);
            return next;
          });
        }
      }
    },
    [supabase, userId, date]
  );

  if (habits.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📋</p>
        <h2 className="text-lg font-semibold text-foreground">
          No habits yet
        </h2>
        <p className="mt-2 text-sm text-muted">
          Head to the Template tab to add your first habit.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Today</h1>
        <p className="text-sm text-muted mt-1">
          {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Progress */}
      <ProgressBar current={done} total={total} />

      {/* Habit list */}
      <div className="mt-5 flex flex-col gap-3">
        {habits.map((habit) => (
          <ChecklistItem
            key={habit.id}
            habit={habit}
            completed={completedIds.has(habit.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 text-center"
          >
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-lg font-semibold text-foreground">All done!</p>
            <p className="text-sm text-muted">
              You completed all your habits today.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
