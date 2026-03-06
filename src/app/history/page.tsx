"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/history/calendar";
import { BottomNav } from "@/components/ui/bottom-nav";
import { createClient } from "@/lib/supabase/client";

type HabitMeta = {
  id: string;
  name: string;
  emoji: string | null;
  frequency_type: string;
  frequency_days: number[] | null;
  frequency_start_date: string | null;
  created_at: string;
};
type CompletionMeta = { habit_id: string; date: string };

function LoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-6 bg-border/30 rounded" />
        <div className="h-7 w-36 bg-border/50 rounded-lg" />
        <div className="h-6 w-6 bg-border/30 rounded" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="h-10 bg-surface rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [habits, setHabits] = useState<HabitMeta[] | null>(null);
  const [completions, setCompletions] = useState<CompletionMeta[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const startDate = ninetyDaysAgo.toISOString().split("T")[0];

      const [habitsRes, completionsRes] = await Promise.all([
        supabase
          .from("habits")
          .select(
            "id, name, emoji, frequency_type, frequency_days, frequency_start_date, created_at"
          )
          .order("sort_order", { ascending: true }),
        supabase.from("completions").select("habit_id, date").gte("date", startDate),
      ]);

      setHabits((habitsRes.data as HabitMeta[]) ?? []);
      setCompletions((completionsRes.data as CompletionMeta[]) ?? []);
    }

    load();
  }, []);

  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      {habits === null ? (
        <LoadingSkeleton />
      ) : (
        <Calendar habits={habits} completions={completions} />
      )}
      <BottomNav />
    </div>
  );
}
