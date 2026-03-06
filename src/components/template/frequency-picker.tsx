"use client";

import type { FrequencyType } from "@/types/database";

interface FrequencyPickerProps {
  type: FrequencyType;
  days: number[];
  onTypeChange: (type: FrequencyType) => void;
  onDaysChange: (days: number[]) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "alternate", label: "Alternate" },
  { value: "specific_days", label: "Specific days" },
];

export function FrequencyPicker({
  type,
  days,
  onTypeChange,
  onDaysChange,
}: FrequencyPickerProps) {
  const toggleDay = (dayIndex: number) => {
    if (days.includes(dayIndex)) {
      onDaysChange(days.filter((d) => d !== dayIndex));
    } else {
      onDaysChange([...days, dayIndex].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-3">
      {/* Type selector */}
      <div className="flex gap-2">
        {FREQUENCY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onTypeChange(option.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              type === option.value
                ? "bg-foreground text-surface"
                : "bg-border/30 text-muted hover:bg-border/50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Day chips for specific_days */}
      {type === "specific_days" && (
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleDay(index)}
              className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                days.includes(index)
                  ? "bg-accent text-white"
                  : "bg-border/30 text-muted hover:bg-border/50"
              }`}
            >
              {label.charAt(0)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
