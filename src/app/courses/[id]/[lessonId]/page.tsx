import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { LessonQuiz } from "@/components/courses/lesson-quiz";

export default async function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id: courseId, lessonId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
  if (!lesson) notFound();

  const { data: course } = await supabase.from("courses").select("title").eq("id", courseId).single();
  const { data: allLessons } = await supabase.from("lessons").select("id, title, order_num").eq("course_id", courseId).order("order_num");

  const { data: completions } = await supabase.from("lesson_completions")
    .select("lesson_id").eq("user_id", user.id);
  const completedIds = new Set(completions?.map(c => c.lesson_id) ?? []);

  const currentIdx = allLessons?.findIndex(l => l.id === lessonId) ?? 0;
  const prevLesson = currentIdx > 0 ? allLessons?.[currentIdx - 1] : null;
  const nextLesson = currentIdx < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentIdx + 1] : null;
  const isCompleted = completedIds.has(lessonId);

  const totalLessons = allLessons?.length ?? 1;
  const completedCount = allLessons?.filter(l => completedIds.has(l.id)).length ?? 0;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-3">
          <Link href={`/courses/${courseId}`}><ArrowLeft className="w-4 h-4 mr-2" />{course?.title}</Link>
        </Button>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Урок {currentIdx + 1} из {totalLessons}</span>
          <span className="text-sm text-muted-foreground">{progressPct}% курса пройдено</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Lesson list sidebar */}
        <div className="md:col-span-1 order-2 md:order-1">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">Уроки</p>
          <div className="space-y-1">
            {allLessons?.map((l, idx) => (
              <Link key={l.id} href={`/courses/${courseId}/${l.id}`}>
                <div className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center gap-2 ${l.id === lessonId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                  <span className="text-xs w-5 text-center">{completedIds.has(l.id) ? "✓" : idx + 1}</span>
                  <span className="line-clamp-2">{l.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-3 order-1 md:order-2 space-y-6">
          <div>
            <Badge className="mb-3">Урок {currentIdx + 1}</Badge>
            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
          </div>

          {/* Video placeholder */}
          <div className="bg-muted rounded-xl h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-primary ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Видео-урок</p>
            </div>
          </div>

          {/* Content */}
          <Card>
            <CardContent className="pt-5">
              <h2 className="font-semibold mb-3">Материал урока</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {lesson.content}
              </div>
            </CardContent>
          </Card>

          {/* Quiz */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <LessonQuiz
              quiz={lesson.quiz}
              lessonId={lessonId}
              courseId={courseId}
              userId={user.id}
              totalLessons={totalLessons}
              completedCount={completedCount}
              isCompleted={isCompleted}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            {prevLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/courses/${courseId}/${prevLesson.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Предыдущий
                </Link>
              </Button>
            ) : <div />}
            {nextLesson && (
              <Button asChild>
                <Link href={`/courses/${courseId}/${nextLesson.id}`}>
                  Следующий<ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
