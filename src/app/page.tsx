import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .limit(3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4" variant="secondary">Mentoria Hub — бета</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Твои возможности.<br />
            <span className="text-primary">Твой темп. Твой путь.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Находи олимпиады, стипендии, хакатоны и летние школы — и учись по курсам Mentoria без привязки к расписанию.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/opportunities">
                <Trophy className="w-5 h-5 mr-2" />
                Найти возможности
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">
                <BookOpen className="w-5 h-5 mr-2" />
                Начать обучение
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-center">
            <div><div className="text-3xl font-bold text-primary">50+</div><div className="text-sm text-muted-foreground">возможностей</div></div>
            <div><div className="text-3xl font-bold text-primary">8</div><div className="text-sm text-muted-foreground">курсов</div></div>
            <div><div className="text-3xl font-bold text-primary">1000+</div><div className="text-sm text-muted-foreground">учеников</div></div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Что такое Mentoria Hub?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card><CardContent className="pt-6 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Каталог возможностей</h3>
              <p className="text-muted-foreground text-sm">Все олимпиады, хакатоны, стипендии и летние школы в одном месте с фильтрами по интересам.</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Асинхронные курсы</h3>
              <p className="text-muted-foreground text-sm">Уроки Mentoria доступны 24/7. Учись в удобное время, отслеживай прогресс и проходи мини-тесты.</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <Star className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Рекомендации</h3>
              <p className="text-muted-foreground text-sm">Платформа анализирует интересы и цели — рекомендует подходящие возможности и курсы.</p>
            </CardContent></Card>
          </div>
        </div>
      </section>

      {/* Recent opportunities */}
      {opportunities && opportunities.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Актуальные возможности</h2>
              <Button variant="ghost" asChild>
                <Link href="/opportunities">Все <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {opportunities.map((opp) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-5">
                      <Badge variant="secondary" className="mb-3">{opp.category}</Badge>
                      <h3 className="font-semibold mb-2 line-clamp-2">{opp.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <span>{opp.format}</span>
                        {opp.deadline && <span>· до {new Date(opp.deadline).toLocaleDateString("ru-RU")}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses preview */}
      {courses && courses.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Курсы Mentoria</h2>
              <Button variant="ghost" asChild>
                <Link href="/courses">Все <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-5">
                      <Badge variant="outline" className="mb-3">{course.level}</Badge>
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-12">Как это работает</h2>
          <div className="space-y-6">
            {[
              "Создай аккаунт и выбери интересы и цели",
              "Получи персональные рекомендации возможностей и курсов",
              "Сохраняй возможности и начинай учиться в удобное время",
              "Отслеживай прогресс и дедлайны в личном кабинете",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                <p className="text-lg">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/auth/register"><Users className="w-5 h-5 mr-2" />Присоединиться к Mentoria</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Готов начать свой путь?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">Более 1000 учеников уже используют Mentoria Hub.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Зарегистрироваться бесплатно</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link href="/opportunities">Посмотреть возможности</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-primary-foreground/70">
            {["Бесплатно навсегда", "Без привязки к расписанию", "Для учеников 8–11 классов"].map(item => (
              <div key={item} className="flex items-center gap-1"><CheckCircle className="w-4 h-4" />{item}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
