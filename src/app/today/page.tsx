"use client";

import { useState, useEffect } from "react";
import { Checklist } from "@/components/checklist/checklist";
import { BottomNav } from "@/components/ui/bottom-nav";
import { createClient } from "@/lib/supabase/client";
import { filterHabitsForDate } from "@/lib/frequency";
import type { Habit, Completion } from "@/types/database";

function LoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-20 bg-border/50 rounded-lg" />
        <div className="h-4 w-40 bg-border/30 rounded mt-2" />
      </div>
      <div className="h-2 bg-border/30 rounded-full mb-5" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[60px] bg-surface rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [userId, setUserId] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [habitsRes, completionsRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.from("completions").select("*").eq("date", today),
      ]);

      const allHabits = (habitsRes.data as Habit[]) ?? [];
      setHabits(filterHabitsForDate(allHabits, new Date()));
      setCompletions((completionsRes.data as Completion[]) ?? []);
    }

    load();
  }, [today]);

  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      {habits === null ? (
        <LoadingSkeleton />
      ) : (
        <Checklist
          habits={habits}
          completions={completions}
          date={today}
          userId={userId}
        />
      )}
      <BottomNav />
    </div>
  );
}
