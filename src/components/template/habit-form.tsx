"use client";

import { useState } from "react";
import { FrequencyPicker } from "./frequency-picker";
import { useHaptics } from "@/lib/haptics";
import type { FrequencyType } from "@/types/database";

interface HabitFormProps {
  onAdd: (habit: {
    name: string;
    emoji: string;
    frequency_type: FrequencyType;
    frequency_days: number[];
  }) => void;
}

export function HabitForm({ onAdd }: HabitFormProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [frequencyDays, setFrequencyDays] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);
  const haptics = useHaptics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      emoji: emoji.trim(),
      frequency_type: frequencyType,
      frequency_days: frequencyDays,
    });

    haptics.tap();
    setName("");
    setEmoji("");
    setFrequencyType("daily");
    setFrequencyDays([]);
    setExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-2xl shadow-sm p-5 space-y-4"
    >
      <div className="flex gap-3">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📌"
          className="w-12 h-12 rounded-xl bg-background border border-border text-center text-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          maxLength={2}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit..."
          className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted/40 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          onFocus={() => setExpanded(true)}
        />
      </div>

      {expanded && (
        <>
          <FrequencyPicker
            type={frequencyType}
            days={frequencyDays}
            onTypeChange={setFrequencyType}
            onDaysChange={setFrequencyDays}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setName("");
                setEmoji("");
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-border/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-foreground text-surface text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
            >
              Add habit
            </button>
          </div>
        </>
      )}
    </form>
  );
}
