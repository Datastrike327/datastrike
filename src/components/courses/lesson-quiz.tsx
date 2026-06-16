"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { toast } from "sonner";

type Props = {
  quiz: QuizQuestion[];
  lessonId: string;
  courseId: string;
  userId: string;
  totalLessons: number;
  completedCount: number;
  isCompleted: boolean;
};

export function LessonQuiz({ quiz, lessonId, courseId, userId, totalLessons, completedCount, isCompleted }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const allAnswered = quiz.every((_, i) => answers[i] !== undefined);
  const score = quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = submitted && score === quiz.length;

  const submit = async () => {
    if (!allAnswered) return;
    setLoading(true);
    setSubmitted(true);

    if (!isCompleted) {
      await supabase.from("lesson_completions").upsert({ user_id: userId, lesson_id: lessonId });
      const newCompleted = completedCount + 1;
      const newProgress = Math.round((newCompleted / totalLessons) * 100);
      await supabase.from("enrollments")
        .update({ progress: newProgress })
        .eq("user_id", userId).eq("course_id", courseId);
      if (newProgress === 100) {
        toast.success("Курс пройден! Получите сертификат 🎓");
      }
    }

    const finalScore = quiz.filter((q, i) => answers[i] === q.answer).length;
    if (finalScore === quiz.length) {
      toast.success(`Отлично! Все ${quiz.length} ответов верны`);
    } else {
      toast.info(`Результат: ${finalScore}/${quiz.length}. Попробуй ещё раз!`);
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-semibold mb-4">Мини-тест</h2>
        <div className="space-y-6">
          {quiz.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium mb-3">{qi + 1}. {q.q}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = submitted && oi === q.answer;
                  const isWrong = submitted && isSelected && oi !== q.answer;

                  return (
                    <button
                      key={oi}
                      onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-2 ${
                        isCorrect ? "border-green-500 bg-green-50 text-green-700" :
                        isWrong ? "border-red-400 bg-red-50 text-red-700" :
                        isSelected ? "border-primary bg-primary/5" :
                        "border-border hover:border-primary/50 hover:bg-muted/50"
                      } disabled:cursor-default`}
                    >
                      {submitted && isCorrect && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {submitted && isWrong && <XCircle className="w-4 h-4 shrink-0" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className={`mt-5 p-4 rounded-lg text-center ${passed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {passed ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Урок пройден! {score}/{quiz.length} правильных ответов</span>
              </div>
            ) : (
              <p>Результат: {score}/{quiz.length}. Прочитай материал ещё раз.</p>
            )}
          </div>
        ) : (
          <Button className="w-full mt-5" onClick={submit} disabled={!allAnswered || loading}>
            {loading ? "Проверяем..." : "Проверить ответы"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
