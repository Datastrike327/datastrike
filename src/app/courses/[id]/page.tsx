import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, Circle, Play, Lock, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/courses/enroll-button";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", id).order("order_num");
  const { data: { user } } = await supabase.auth.getUser();

  let progress = -1;
  let completedLessons = new Set<string>();

  if (user) {
    const { data: enrollment } = await supabase.from("enrollments")
      .select("progress").eq("user_id", user.id).eq("course_id", id).single();
    if (enrollment) progress = enrollment.progress;

    const { data: completions } = await supabase.from("lesson_completions")
      .select("lesson_id").eq("user_id", user.id);
    completedLessons = new Set(completions?.map(c => c.lesson_id) ?? []);
  }

  const isEnrolled = progress >= 0;
  const firstIncomplete = lessons?.find(l => !completedLessons.has(l.id));

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/courses"><ArrowLeft className="w-4 h-4 mr-2" />Все курсы</Link>
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{course.level}</Badge>
            <Badge variant="outline">{lessons?.length} уроков</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground mb-6">{course.description}</p>

          <h2 className="font-semibold text-lg mb-4">Программа курса</h2>
          <div className="space-y-2">
            {lessons?.map((lesson, idx) => {
              const isDone = completedLessons.has(lesson.id);
              const isLocked = !isEnrolled;
              return (
                <Card key={lesson.id} className={`transition-shadow ${!isLocked ? "hover:shadow-sm" : "opacity-60"}`}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm text-muted-foreground w-6 shrink-0">{idx + 1}.</span>
                      <span className="font-medium flex-1">{lesson.title}</span>
                      {isEnrolled && (
                        <Button size="sm" variant={isDone ? "outline" : "ghost"} asChild>
                          <Link href={`/courses/${id}/${lesson.id}`}>
                            {isDone ? "Повторить" : <><Play className="w-3 h-3 mr-1" />Начать</>}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              {isEnrolled ? (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Прогресс</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {completedLessons.size} из {lessons?.length} уроков пройдено
                    </p>
                  </div>
                  <Separator />
                  {firstIncomplete ? (
                    <Button className="w-full" asChild>
                      <Link href={`/courses/${id}/${firstIncomplete.id}`}>
                        <Play className="w-4 h-4 mr-2" />Продолжить
                      </Link>
                    </Button>
                  ) : (
                    <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 text-center">
                      <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
                      <p className="font-bold text-base mb-1">Поздравляем!</p>
                      <p className="text-xs text-muted-foreground mb-3">Курс «{course.title}» успешно пройден</p>
                      <Badge className="text-xs px-3 py-1">Сертификат получен ✓</Badge>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center py-2">
                    <p className="text-2xl font-bold mb-1">Бесплатно</p>
                    <p className="text-sm text-muted-foreground">{lessons?.length} уроков · {course.level}</p>
                  </div>
                  <EnrollButton courseId={id} userId={user?.id ?? null} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-2 text-sm">
              <p className="font-semibold">Чему ты научишься:</p>
              <ul className="space-y-1 text-muted-foreground">
                {course.tags?.map((tag: string) => (
                  <li key={tag} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    {tag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
