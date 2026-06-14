import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, BookOpen, Calendar, Star, Trophy } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
  if (profile && !profile.onboarding_done) redirect("/onboarding");

  const [{ data: savedOpps }, { data: enrollments }, { data: allOpps }, { data: allCourses }] = await Promise.all([
    supabase.from("saved_opportunities").select("*, opportunity:opportunities(*)").eq("user_id", user.id),
    supabase.from("enrollments").select("*, course:courses(*)").eq("user_id", user.id),
    supabase.from("opportunities").select("*"),
    supabase.from("courses").select("*"),
  ]);

  // Recommendation logic: match by tags/interests
  const userInterests = profile?.interests ?? [];
  const recommendedOpps = allOpps?.filter(o =>
    o.tags?.some((t: string) => userInterests.includes(t)) &&
    !savedOpps?.some(s => s.opportunity_id === o.id)
  ).slice(0, 3) ?? [];

  const recommendedCourses = allCourses?.filter(c =>
    c.tags?.some((t: string) => userInterests.includes(t)) &&
    !enrollments?.some(e => e.course_id === c.id)
  ).slice(0, 2) ?? [];

  // Upcoming deadlines
  const upcoming = savedOpps
    ?.filter(s => s.opportunity?.deadline)
    .sort((a, b) => new Date(a.opportunity.deadline).getTime() - new Date(b.opportunity.deadline).getTime())
    .slice(0, 5) ?? [];

  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "Ученик";

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Привет, {name}! 👋</h1>
        <p className="text-muted-foreground">
          {profile?.grade && `${profile.grade} класс · `}Твой личный кабинет Mentoria Hub
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="pt-5 text-center">
          <Bookmark className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{savedOpps?.length ?? 0}</div>
          <div className="text-xs text-muted-foreground">Сохранено</div>
        </CardContent></Card>
        <Card><CardContent className="pt-5 text-center">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{enrollments?.length ?? 0}</div>
          <div className="text-xs text-muted-foreground">Курсов</div>
        </CardContent></Card>
        <Card><CardContent className="pt-5 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{enrollments?.filter(e => e.progress === 100).length ?? 0}</div>
          <div className="text-xs text-muted-foreground">Пройдено</div>
        </CardContent></Card>
        <Card><CardContent className="pt-5 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{upcoming.length}</div>
          <div className="text-xs text-muted-foreground">Дедлайнов</div>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="courses">
            <TabsList className="mb-4">
              <TabsTrigger value="courses">Мои курсы</TabsTrigger>
              <TabsTrigger value="saved">Сохранённые</TabsTrigger>
              <TabsTrigger value="recommended">Рекомендации</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.map(e => (
                    <Card key={e.id}>
                      <CardContent className="py-4 px-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{e.course?.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={e.progress} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground shrink-0">{e.progress}%</span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/courses/${e.course_id}`}>{e.progress === 100 ? "Готово ✓" : "Продолжить"}</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Ты ещё не записан ни на один курс</p>
                  <Button className="mt-4" asChild><Link href="/courses">Найти курсы</Link></Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              {savedOpps && savedOpps.length > 0 ? (
                <div className="space-y-3">
                  {savedOpps.map(s => s.opportunity && (
                    <Card key={s.id}>
                      <CardContent className="py-4 px-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{s.opportunity.category}</Badge>
                              {s.opportunity.deadline && (
                                <span className="text-xs text-muted-foreground">до {new Date(s.opportunity.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                              )}
                            </div>
                            <p className="font-medium truncate">{s.opportunity.title}</p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/opportunities/${s.opportunity_id}`}>Открыть</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Нет сохранённых возможностей</p>
                  <Button className="mt-4" asChild><Link href="/opportunities">Найти возможности</Link></Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommended">
              <div className="space-y-4">
                {recommendedOpps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1"><Star className="w-4 h-4" />Возможности для тебя</p>
                    <div className="space-y-2">
                      {recommendedOpps.map(o => (
                        <Card key={o.id}>
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <Badge variant="secondary" className="text-xs mb-1">{o.category}</Badge>
                                <p className="text-sm font-medium">{o.title}</p>
                              </div>
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/opportunities/${o.id}`}>→</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {recommendedCourses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1"><BookOpen className="w-4 h-4" />Рекомендуемые курсы</p>
                    <div className="space-y-2">
                      {recommendedCourses.map(c => (
                        <Card key={c.id}>
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <Badge variant="outline" className="text-xs mb-1">{c.level}</Badge>
                                <p className="text-sm font-medium">{c.title}</p>
                              </div>
                              <Button size="sm" asChild>
                                <Link href={`/courses/${c.id}`}>Начать</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {recommendedOpps.length === 0 && recommendedCourses.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Обнови профиль чтобы получить рекомендации</p>
                    <Button className="mt-4" variant="outline" asChild><Link href="/onboarding">Обновить профиль</Link></Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Upcoming deadlines */}
        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />Ближайшие дедлайны</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-2">
              {upcoming.map(s => {
                const days = Math.ceil((new Date(s.opportunity.deadline).getTime() - Date.now()) / 86400000);
                return (
                  <Card key={s.id}>
                    <CardContent className="py-3 px-4">
                      <Link href={`/opportunities/${s.opportunity_id}`} className="hover:text-primary">
                        <p className="text-sm font-medium line-clamp-2 mb-1">{s.opportunity.title}</p>
                        <Badge variant={days <= 7 ? "destructive" : "secondary"} className="text-xs">
                          {days <= 0 ? "Истёк" : days === 1 ? "Завтра" : `${days} дн.`}
                        </Badge>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Нет приближающихся дедлайнов. Сохраняй возможности чтобы отслеживать их.</p>
          )}
        </div>
      </div>
    </div>
  );
}
