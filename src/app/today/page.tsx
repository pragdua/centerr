import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Checklist } from "@/components/checklist/checklist";
import { BottomNav } from "@/components/ui/bottom-nav";
import { filterHabitsForDate } from "@/lib/frequency";
import type { Habit, Completion } from "@/types/database";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const today = new Date().toISOString().split("T")[0];

  const { data: allHabits } = await supabase
    .from("habits")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const todaysHabits = filterHabitsForDate(
    (allHabits as Habit[]) ?? [],
    new Date()
  );

  const { data: completions } = await supabase
    .from("completions")
    .select("*")
    .eq("date", today);

  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      <Checklist
        habits={todaysHabits}
        completions={(completions as Completion[]) ?? []}
        date={today}
        userId={user.id}
      />
      <BottomNav />
    </div>
  );
}
