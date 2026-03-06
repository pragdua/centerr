import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HabitList } from "@/components/template/habit-list";
import { BottomNav } from "@/components/ui/bottom-nav";
import { SetupNotice } from "@/components/ui/setup-notice";
import type { Habit } from "@/types/database";

export default async function TemplatePage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      <HabitList initialHabits={(habits as Habit[]) ?? []} userId={user.id} />
      <BottomNav />
    </div>
  );
}
