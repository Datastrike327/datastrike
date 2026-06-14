import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Globe, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaveButton } from "@/components/opportunities/save-button";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: opp } = await supabase.from("opportunities").select("*").eq("id", id).single();
  if (!opp) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let isSaved = false;
  if (user) {
    const { data } = await supabase.from("saved_opportunities")
      .select("id").eq("user_id", user.id).eq("opportunity_id", id).single();
    isSaved = !!data;
  }

  const { data: related } = await supabase.from("opportunities")
    .select("*").eq("category", opp.category).neq("id", id).limit(3);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/opportunities"><ArrowLeft className="w-4 h-4 mr-2" />Назад к каталогу</Link>
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>{opp.category}</Badge>
              <Badge variant="outline">{opp.format}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{opp.title}</h1>
            {opp.description && (
              <p className="text-muted-foreground leading-relaxed">{opp.description}</p>
            )}
          </div>

          {opp.requirements && (
            <div>
              <h2 className="font-semibold text-lg mb-3">Требования</h2>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground">{opp.requirements}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {opp.tags && opp.tags.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3">Теги</h2>
              <div className="flex flex-wrap gap-2">
                {opp.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              {opp.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Дедлайн</p>
                    <p className="font-semibold">{new Date(opp.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Формат</p>
                  <p className="font-semibold">{opp.format}</p>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                {opp.apply_url && (
                  <Button className="w-full" asChild>
                    <a href={opp.apply_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />Подать заявку
                    </a>
                  </Button>
                )}
                <SaveButton oppId={id} userId={user?.id ?? null} initialSaved={isSaved} />
              </div>
            </CardContent>
          </Card>

          {related && related.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Похожие возможности</h3>
              <div className="space-y-2">
                {related.map(r => (
                  <Link key={r.id} href={`/opportunities/${r.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="py-3 px-4">
                        <p className="text-sm font-medium line-clamp-2">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.format}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
