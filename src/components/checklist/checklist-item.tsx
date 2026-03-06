"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useHaptics } from "@/lib/haptics";

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
  const haptics = useHaptics();

  const handleChange = (checked: boolean) => {
    if (checked) {
      haptics.checkHabit();
    } else {
      haptics.uncheckHabit();
    }
    onToggle(habit.id, checked);
  };

  return (
    <motion.div
      layout
      className="flex items-center gap-4 px-5 py-4 bg-surface rounded-2xl shadow-sm"
      animate={{ opacity: completed ? 0.55 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Checkbox checked={completed} onChange={handleChange} />
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {habit.emoji && <span className="text-xl shrink-0">{habit.emoji}</span>}
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
    </motion.div>
  );
}
