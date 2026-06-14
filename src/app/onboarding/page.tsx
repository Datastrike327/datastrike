"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INTERESTS, GOALS, GRADES } from "@/lib/types";
import { CheckCircle } from "lucide-react";

type Step = "grade" | "interests" | "goals";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("grade");
  const [grade, setGrade] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const finish = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    await supabase.from("user_profiles").upsert({
      id: user.id,
      grade,
      interests,
      goals,
      onboarding_done: true,
    });
    router.push("/dashboard");
  };

  const steps: Step[] = ["grade", "interests", "goals"];
  const stepIdx = steps.indexOf(step);
  const progress = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-bold">Добро пожаловать в Mentoria Hub!</h1>
          <p className="text-muted-foreground mt-2">Расскажи о себе — мы подберём лучшие возможности для тебя</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === "grade" && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-6">В каком классе ты учишься?</h2>
              <div className="grid grid-cols-2 gap-3">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`py-6 rounded-xl border-2 text-center font-bold text-xl transition-all ${grade === g ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}
                  >
                    {g} класс
                  </button>
                ))}
              </div>
              <Button className="w-full mt-6" onClick={() => setStep("interests")} disabled={!grade}>
                Далее →
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "interests" && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-2">Что тебя интересует?</h2>
              <p className="text-sm text-muted-foreground mb-6">Выбери всё что подходит</p>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map(({ label, value }) => {
                  const selected = interests.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleItem(interests, setInterests, value)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all flex items-center gap-2 ${selected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}
                    >
                      {selected && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("grade")}>← Назад</Button>
                <Button className="flex-1" onClick={() => setStep("goals")} disabled={interests.length === 0}>
                  Далее →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "goals" && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-2">Каковы твои цели?</h2>
              <p className="text-sm text-muted-foreground mb-6">Выбери всё что подходит</p>
              <div className="grid grid-cols-1 gap-2">
                {GOALS.map(({ label, value }) => {
                  const selected = goals.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleItem(goals, setGoals, value)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all flex items-center gap-2 ${selected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}
                    >
                      {selected && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("interests")}>← Назад</Button>
                <Button className="flex-1" onClick={finish} disabled={goals.length === 0 || loading}>
                  {loading ? "Сохраняем..." : "Начать! 🚀"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
