import type { Habit } from "@/types/database";

/**
 * Check if a habit should appear on a given date based on its frequency settings.
 */
export function isHabitActiveOnDate(habit: Habit, date: Date): boolean {
  switch (habit.frequency_type) {
    case "daily":
      return true;

    case "alternate": {
      if (!habit.frequency_start_date) return true;
      const start = new Date(habit.frequency_start_date);
      const diffMs = date.getTime() - start.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      return diffDays % 2 === 0;
    }

    case "specific_days": {
      if (!habit.frequency_days || habit.frequency_days.length === 0)
        return true;
      return habit.frequency_days.includes(date.getDay());
    }

    default:
      return true;
  }
}

/**
 * Filter habits to only those active on a given date.
 */
export function filterHabitsForDate(habits: Habit[], date: Date): Habit[] {
  return habits.filter((habit) => isHabitActiveOnDate(habit, date));
}

/**
 * Get a human-readable label for a habit's frequency.
 */
export function getFrequencyLabel(habit: Habit): string {
  switch (habit.frequency_type) {
    case "daily":
      return "Every day";
    case "alternate":
      return "Alternate days";
    case "specific_days": {
      if (!habit.frequency_days || habit.frequency_days.length === 0)
        return "Every day";
      if (habit.frequency_days.length === 7) return "Every day";
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return habit.frequency_days
        .sort((a, b) => a - b)
        .map((d) => dayNames[d])
        .join(", ");
    }
    default:
      return "Every day";
  }
}
