import { BottomNav } from "./bottom-nav";

export function SetupNotice() {
  return (
    <div className="min-h-dvh bg-background px-4 pt-14 pb-24">
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-4xl mb-4">🔧</p>
        <h2 className="text-lg font-semibold text-foreground">
          Setup required
        </h2>
        <p className="mt-2 text-sm text-muted max-w-xs mx-auto">
          Create a Supabase project and add your credentials to{" "}
          <code className="text-xs bg-border/30 px-1.5 py-0.5 rounded">
            .env.local
          </code>
        </p>
        <div className="mt-6 text-left bg-surface rounded-xl p-4 text-xs font-mono text-muted space-y-1">
          <p>NEXT_PUBLIC_SUPABASE_URL=https://...</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
