"use client";

import { useState, useEffect } from "react";
import { HabitList } from "@/components/template/habit-list";
import { BottomNav } from "@/components/ui/bottom-nav";
import { createClient } from "@/lib/supabase/client";
import type { Habit } from "@/types/database";

function LoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-28 bg-border/50 rounded-lg" />
        <div className="h-9 w-9 bg-border/30 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] bg-surface rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function TemplatePage() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("habits")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      setHabits((data as Habit[]) ?? []);
    }

    load();
  }, []);

  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      {habits === null ? (
        <LoadingSkeleton />
      ) : (
        <HabitList initialHabits={habits} userId={userId} />
      )}
      <BottomNav />
    </div>
  );
}
