import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase.from("courses").select("*, lessons(id)").order("created_at");
  const { data: { user } } = await supabase.auth.getUser();

  let enrollments: Record<string, number> = {};
  if (user) {
    const { data } = await supabase.from("enrollments").select("course_id, progress").eq("user_id", user.id);
    enrollments = Object.fromEntries(data?.map(e => [e.course_id, e.progress]) ?? []);
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Курсы Mentoria</h1>
        <p className="text-muted-foreground">Учись в удобное время. Все курсы бесплатны для участников Mentoria.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map(course => {
          const progress = enrollments[course.id] ?? -1;
          const lessonCount = course.lessons?.length ?? 0;
          const isEnrolled = progress >= 0;

          return (
            <Card key={course.id} className="flex flex-col hover:shadow-md transition-shadow">
              {/* Thumbnail placeholder */}
              <div className="h-36 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary/50" />
              </div>
              <CardContent className="pt-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{course.level}</Badge>
                  <span className="text-xs text-muted-foreground">{lessonCount} урок{lessonCount !== 1 ? "а" : ""}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">{course.description}</p>

                {isEnrolled && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Прогресс</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button asChild className="w-full mt-auto">
                  <Link href={`/courses/${course.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    {isEnrolled ? (progress === 100 ? "Пройден ✓" : "Продолжить") : "Начать курс"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
