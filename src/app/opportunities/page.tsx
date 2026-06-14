"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkCheck, Search, Filter } from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { CATEGORIES, FORMATS } from "@/lib/types";

const ALL = "Все";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [format, setFormat] = useState(ALL);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const { data } = await supabase.from("opportunities").select("*").order("deadline");
      setOpportunities(data ?? []);

      if (user) {
        const { data: savedData } = await supabase
          .from("saved_opportunities")
          .select("opportunity_id")
          .eq("user_id", user.id);
        setSaved(new Set(savedData?.map(s => s.opportunity_id) ?? []));
      }
      setLoading(false);
    };
    load();
  }, []);

  const toggleSave = async (oppId: string) => {
    if (!userId) return;
    if (saved.has(oppId)) {
      await supabase.from("saved_opportunities").delete().eq("user_id", userId).eq("opportunity_id", oppId);
      setSaved(prev => { const n = new Set(prev); n.delete(oppId); return n; });
    } else {
      await supabase.from("saved_opportunities").insert({ user_id: userId, opportunity_id: oppId });
      setSaved(prev => new Set(prev).add(oppId));
    }
  };

  const filtered = opportunities.filter(o => {
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === ALL || o.category === category;
    const matchFmt = format === ALL || o.format === format;
    return matchSearch && matchCat && matchFmt;
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Образовательные возможности</h1>
        <p className="text-muted-foreground">Олимпиады, хакатоны, стипендии, летние школы и стажировки</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[ALL, ...CATEGORIES].map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {[ALL, ...FORMATS].map(fmt => (
            <Button
              key={fmt}
              size="sm"
              variant={format === fmt ? "default" : "outline"}
              onClick={() => setFormat(fmt)}
            >
              {fmt}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Ничего не найдено</p>
          <p className="text-sm">Попробуй изменить фильтры</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(opp => (
            <Card key={opp.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="pt-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary">{opp.category}</Badge>
                  <button
                    onClick={() => toggleSave(opp.id)}
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title={saved.has(opp.id) ? "Убрать из сохранённых" : "Сохранить"}
                  >
                    {saved.has(opp.id)
                      ? <BookmarkCheck className="w-5 h-5 text-primary" />
                      : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
                <Link href={`/opportunities/${opp.id}`} className="flex-1">
                  <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">{opp.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{opp.description}</p>
                </Link>
                <div className="flex items-center justify-between mt-auto pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{opp.format}</Badge>
                    {opp.deadline && (
                      <span>до {new Date(opp.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/opportunities/${opp.id}`}>Подробнее →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground mt-6 text-center">
        Показано {filtered.length} из {opportunities.length} возможностей
      </p>
    </div>
  );
}
