"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { FrequencyPicker } from "./frequency-picker";
import { getFrequencyLabel } from "@/lib/frequency";
import { useHaptics } from "@/lib/haptics";
import type { Habit, FrequencyType } from "@/types/database";

interface HabitItemProps {
  habit: Habit;
  onUpdate: (
    id: string,
    updates: {
      name?: string;
      emoji?: string | null;
      frequency_type?: FrequencyType;
      frequency_days?: number[];
    }
  ) => void;
  onDeactivate: (id: string) => void;
}

export function HabitItem({ habit, onUpdate, onDeactivate }: HabitItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [emoji, setEmoji] = useState(habit.emoji || "");
  const [freqType, setFreqType] = useState<FrequencyType>(
    habit.frequency_type
  );
  const [freqDays, setFreqDays] = useState<number[]>(
    habit.frequency_days || []
  );
  const haptics = useHaptics();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(habit.id, {
      name: name.trim() || habit.name,
      emoji: emoji.trim() || null,
      frequency_type: freqType,
      frequency_days: freqDays,
    });
    setEditing(false);
    haptics.tap();
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          {/* Drag handle */}
          <button
            type="button"
            className="touch-manipulation cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted"
            {...attributes}
            {...listeners}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 112 0 2 2 0 01-2 0zm0 6a2 2 0 112 0 2 2 0 01-2 0zm0 6a2 2 0 112 0 2 2 0 01-2 0zm6-12a2 2 0 112 0 2 2 0 01-2 0zm0 6a2 2 0 112 0 2 2 0 01-2 0zm0 6a2 2 0 112 0 2 2 0 01-2 0z" />
            </svg>
          </button>

          {/* Content */}
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
          >
            {habit.emoji && (
              <span className="text-xl shrink-0">{habit.emoji}</span>
            )}
            <div className="min-w-0">
              <p className="text-base font-medium text-foreground truncate">
                {habit.name}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {getFrequencyLabel(habit)}
              </p>
            </div>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              haptics.tap();
              onDeactivate(habit.id);
            }}
            className="text-muted/30 hover:text-red-400 transition-colors p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Edit panel */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="📌"
                    className="w-12 h-10 rounded-lg bg-background border border-border text-center text-lg outline-none focus:border-accent transition-all"
                    maxLength={2}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:border-accent transition-all"
                  />
                </div>

                <FrequencyPicker
                  type={freqType}
                  days={freqDays}
                  onTypeChange={setFreqType}
                  onDaysChange={setFreqDays}
                />

                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-xl bg-foreground text-surface text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Save changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
