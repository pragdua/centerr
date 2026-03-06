"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useHaptics } from "@/lib/haptics";

interface CalendarProps {
  habits: Array<{
    id: string;
    name: string;
    emoji: string | null;
    frequency_type: string;
    frequency_days: number[] | null;
    frequency_start_date: string | null;
    created_at: string;
  }>;
  completions: Array<{ habit_id: string; date: string }>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

export function Calendar({ habits, completions }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const haptics = useHaptics();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build completion map: date -> set of completed habit IDs
  const completionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const c of completions) {
      if (!map.has(c.date)) map.set(c.date, new Set());
      map.get(c.date)!.add(c.habit_id);
    }
    return map;
  }, [completions]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    const days: Array<{
      date: string;
      day: number;
      completionPct: number;
      isToday: boolean;
      isFuture: boolean;
    } | null> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const completedSet = completionMap.get(dateStr);
      const completedCount = completedSet?.size ?? 0;
      const totalHabits = habits.length || 1;
      const pct = completedCount / totalHabits;

      days.push({
        date: dateStr,
        day: d,
        completionPct: pct,
        isToday: dateStr === today,
        isFuture: dateStr > today,
      });
    }

    return days;
  }, [year, month, habits.length, completionMap]);

  const prevMonth = () => {
    haptics.tap();
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    haptics.tap();
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  // Selected day details
  const selectedDayHabits = useMemo(() => {
    if (!selectedDate) return [];
    const completedSet = completionMap.get(selectedDate) ?? new Set();
    return habits.map((h) => ({
      ...h,
      completed: completedSet.has(h.id),
    }));
  }, [selectedDate, habits, completionMap]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">History</h1>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-border/30 text-muted transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-border/30 text-muted transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-surface rounded-2xl shadow-sm p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const isSelected = selectedDate === day.date;

            return (
              <button
                key={day.date}
                onClick={() => {
                  if (!day.isFuture) {
                    haptics.tap();
                    setSelectedDate(isSelected ? null : day.date);
                  }
                }}
                disabled={day.isFuture}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative ${
                  day.isFuture
                    ? "text-muted/30 cursor-default"
                    : isSelected
                    ? "ring-2 ring-accent"
                    : "hover:bg-border/20"
                } ${day.isToday ? "font-bold" : ""}`}
              >
                {/* Completion fill */}
                {day.completionPct > 0 && !day.isFuture && (
                  <div
                    className="absolute inset-1 rounded-lg transition-colors"
                    style={{
                      backgroundColor:
                        day.completionPct >= 1
                          ? "oklch(0.72 0.19 155 / 0.2)"
                          : "oklch(0.72 0.19 155 / 0.08)",
                    }}
                  />
                )}
                <span className="relative z-10">{day.day}</span>
                {day.isToday && (
                  <div
                    className="absolute bottom-1.5 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "oklch(0.65 0.18 25)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-surface rounded-2xl shadow-sm p-4"
        >
          <p className="text-sm font-semibold text-foreground mb-3">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
          <div className="space-y-2">
            {selectedDayHabits.length === 0 ? (
              <p className="text-sm text-muted">No habits tracked.</p>
            ) : (
              selectedDayHabits.map((h) => (
                <div key={h.id} className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      h.completed
                        ? "bg-success text-white"
                        : "border border-border"
                    }`}
                  >
                    {h.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {h.emoji && <span className="text-sm">{h.emoji}</span>}
                  <span
                    className={`text-sm ${
                      h.completed ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {h.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
