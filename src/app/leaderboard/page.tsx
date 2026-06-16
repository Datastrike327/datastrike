import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, progress, course:courses(title)")
    .eq("progress", 100);

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name, grade");

  // Build leaderboard: count completed courses per user
  const counts: Record<string, { name: string; grade: number | null; completed: number }> = {};
  for (const e of enrollments ?? []) {
    if (!counts[e.user_id]) {
      const profile = profiles?.find((p) => p.id === e.user_id);
      const name = profile?.full_name ?? `Ученик`;
      counts[e.user_id] = { name, grade: profile?.grade ?? null, completed: 0 };
    }
    counts[e.user_id].completed += 1;
  }

  const ranked = Object.entries(counts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 20);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Лидерборд</h1>
        </div>
        <p className="text-muted-foreground">Ученики, которые прошли больше всего курсов</p>
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Medal className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Пока никто не завершил курс</p>
          <p className="text-sm">Стань первым! Запишись на курс и пройди все уроки.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((entry, idx) => (
            <Card
              key={entry.id}
              className={`transition-shadow ${idx < 3 ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 text-center shrink-0">
                    {idx < 3 ? (
                      <span className="text-2xl">{medals[idx]}</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{entry.name}</p>
                    {entry.grade && (
                      <p className="text-sm text-muted-foreground">{entry.grade} класс</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant={idx < 3 ? "default" : "secondary"} className="text-sm">
                      {entry.completed} {entry.completed === 1 ? "курс" : entry.completed < 5 ? "курса" : "курсов"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center mt-8">
        Результаты обновляются в реальном времени
      </p>
    </div>
  );
}
