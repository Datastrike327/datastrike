import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, title, category, format, deadline")
    .not("deadline", "is", null)
    .order("deadline");

  const now = Date.now();

  const withDays = (opportunities ?? []).map((opp) => {
    const daysLeft = Math.ceil((new Date(opp.deadline!).getTime() - now) / 86400000);
    return { ...opp, daysLeft };
  });

  // Group by month
  const grouped: Record<string, typeof withDays> = {};
  for (const opp of withDays) {
    const key = new Date(opp.deadline!).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(opp);
  }

  function urgencyBadge(daysLeft: number) {
    if (daysLeft <= 0) return <Badge variant="outline" className="text-xs shrink-0">Истёк</Badge>;
    if (daysLeft <= 7) return <Badge variant="destructive" className="text-xs shrink-0">Срочно · {daysLeft} дн.</Badge>;
    if (daysLeft <= 30) return <Badge variant="secondary" className="text-xs shrink-0 bg-amber-100 text-amber-800">{daysLeft} дней</Badge>;
    return <Badge variant="secondary" className="text-xs shrink-0">{daysLeft} дней</Badge>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Календарь дедлайнов</h1>
        </div>
        <p className="text-muted-foreground">Все дедлайны образовательных возможностей в одном месте</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted-foreground text-center py-16">Нет предстоящих дедлайнов</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, opps]) => (
            <div key={month}>
              <h2 className="text-lg font-semibold mb-3 capitalize text-primary">{month}</h2>
              <div className="space-y-2">
                {opps.map((opp) => (
                  <Card key={opp.id} className={`transition-shadow hover:shadow-sm ${opp.daysLeft <= 0 ? "opacity-50" : ""}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 text-center shrink-0">
                          <div className="text-xl font-bold text-primary leading-none">
                            {new Date(opp.deadline!).getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(opp.deadline!).toLocaleDateString("ru-RU", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{opp.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{opp.category}</Badge>
                            <span className="text-xs text-muted-foreground">{opp.format}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {urgencyBadge(opp.daysLeft)}
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/opportunities/${opp.id}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
