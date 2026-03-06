import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar } from "@/components/history/calendar";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch all habits (including inactive) for history context
  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, emoji, frequency_type, frequency_days, frequency_start_date, created_at")
    .order("sort_order", { ascending: true });

  // Fetch completions for the last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const startDate = ninetyDaysAgo.toISOString().split("T")[0];

  const { data: completions } = await supabase
    .from("completions")
    .select("habit_id, date")
    .gte("date", startDate);

  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      <Calendar
        habits={(habits ?? []) as Array<{ id: string; name: string; emoji: string | null; frequency_type: string; frequency_days: number[] | null; frequency_start_date: string | null; created_at: string }>}
        completions={(completions ?? []) as Array<{ habit_id: string; date: string }>}
      />
      <BottomNav />
    </div>
  );
}
