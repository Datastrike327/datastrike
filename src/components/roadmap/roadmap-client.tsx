"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map, BookOpen, Trophy, GraduationCap, Code2, Globe, ArrowRight } from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  category: string;
  deadline: string | null;
  grades: number[] | null;
};

const ROADMAP: Record<number, {
  academic: { icon: string; text: string }[];
  projects: { icon: string; text: string }[];
  university: { icon: string; text: string }[];
  english: { icon: string; text: string }[];
}> = {
  8: {
    academic: [
      { icon: "📐", text: "Олимпиада по математике — школьный и городской уровень" },
      { icon: "🔬", text: "Участие в Science Fair — исследовательский проект" },
      { icon: "💡", text: "Кружки STEM: робототехника, химия, биология" },
    ],
    projects: [
      { icon: "🌍", text: "Волонтёрские проекты в школе и районе" },
      { icon: "🎨", text: "Творческие конкурсы — развивай нестандартное мышление" },
      { icon: "📚", text: "Чтение профессиональной литературы по интересам" },
    ],
    university: [
      { icon: "📝", text: "Начни изучать, что такое SAT/IELTS — пока просто ознакомься" },
      { icon: "🏫", text: "Исследуй топ-вузы Казахстана и России" },
      { icon: "🗺️", text: "Выбери 2–3 направления, которые тебя интересуют" },
    ],
    english: [
      { icon: "🗣️", text: "Занятия английским 3+ раза в неделю" },
      { icon: "🎬", text: "Фильмы, подкасты и книги на английском" },
      { icon: "🎯", text: "Цель: достичь уровня B1 к концу года" },
    ],
  },
  9: {
    academic: [
      { icon: "📐", text: "Городская/республиканская олимпиада по математике или физике" },
      { icon: "💻", text: "Первые шаги в программировании — Python, алгоритмы" },
      { icon: "🔬", text: "Исследовательский проект на городской Science Fair" },
    ],
    projects: [
      { icon: "💼", text: "Young Entrepreneurs — первые бизнес-конкурсы" },
      { icon: "🤝", text: "Волонтёрство в организации с сертификатом" },
      { icon: "🏆", text: "Локальный хакатон или кейс-чемпионат" },
    ],
    university: [
      { icon: "📝", text: "Начни официальную подготовку к SAT или IELTS" },
      { icon: "🌐", text: "Изучи требования топ-вузов — что они смотрят в аппликанте" },
      { icon: "📋", text: "Начни портфолио — проекты, награды, волонтёрство" },
    ],
    english: [
      { icon: "📖", text: "Цель: уровень B2 к концу года" },
      { icon: "🏅", text: "Запишись на Cambridge или IELTS академического уровня" },
      { icon: "🗺️", text: "Практика разговорного английского — клубы, онлайн" },
    ],
  },
  10: {
    academic: [
      { icon: "🏆", text: "Республиканская олимпиада по приоритетному предмету" },
      { icon: "🔬", text: "Публикация или участие в научной конференции" },
      { icon: "💻", text: "Хакатон AI & Society или международный конкурс" },
    ],
    projects: [
      { icon: "💼", text: "YES Kazakhstan или крупная стажировка (Kolesa, другие)" },
      { icon: "🌍", text: "MUN (Model UN) — развитие лидерства и риторики" },
      { icon: "🚀", text: "Запусти собственный мини-проект с реальным продуктом" },
    ],
    university: [
      { icon: "📝", text: "Сдай IELTS или SAT — целевой балл для поступления" },
      { icon: "🎓", text: "Летняя школа в вузе — первый университетский опыт" },
      { icon: "📋", text: "Напиши черновик мотивационного эссе" },
    ],
    english: [
      { icon: "🎯", text: "Цель: IELTS 6.5+ или SAT Reading 600+" },
      { icon: "📚", text: "Академическое письмо — essays, reports, emails" },
      { icon: "🗣️", text: "Дебаты и публичные выступления на английском" },
    ],
  },
  11: {
    academic: [
      { icon: "🏅", text: "Финальная республиканская олимпиада — максимальный результат" },
      { icon: "🔬", text: "Завершить и защитить исследовательский проект" },
      { icon: "🎓", text: "Стипендия Болашак или Junior — подача документов" },
    ],
    projects: [
      { icon: "💼", text: "Финальная значимая стажировка перед поступлением" },
      { icon: "📊", text: "Finance School, Science Fair — крупные конкурсы для резюме" },
      { icon: "🌍", text: "Астана MUN или international MUN для опыта" },
    ],
    university: [
      { icon: "📝", text: "Подача заявок в вузы — дедлайны в декабре–январе" },
      { icon: "✍️", text: "Финальные версии эссе и рекомендательных писем" },
      { icon: "🎯", text: "Ent / SAT / IELTS финальная сдача" },
    ],
    english: [
      { icon: "🎯", text: "Цель: IELTS 7.0+ / TOEFL 100+ / SAT 1200+" },
      { icon: "💬", text: "Практика интервью на английском — для университетов" },
      { icon: "📄", text: "Проверь все документы и эссе с ментором" },
    ],
  },
};

const sections = [
  { key: "academic", label: "Академическая подготовка", icon: BookOpen, color: "text-blue-500" },
  { key: "projects", label: "Проекты и конкурсы", icon: Trophy, color: "text-amber-500" },
  { key: "university", label: "Подготовка к поступлению", icon: GraduationCap, color: "text-green-500" },
  { key: "english", label: "Английский язык", icon: Globe, color: "text-purple-500" },
] as const;

export function RoadmapClient({ initialGrade, opportunities }: { initialGrade: number; opportunities: Opportunity[] }) {
  const [grade, setGrade] = useState<number>(initialGrade);
  const roadmap = ROADMAP[grade];

  const gradeOpps = opportunities.filter(
    (o) => !o.grades || o.grades.includes(grade)
  ).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Мой Roadmap</h1>
        </div>
        <p className="text-muted-foreground">Персональный план развития — что делать в твоём классе</p>
      </div>

      {/* Grade selector */}
      <div className="flex gap-2 mb-8">
        {[8, 9, 10, 11].map((g) => (
          <Button
            key={g}
            size="sm"
            variant={grade === g ? "default" : "outline"}
            onClick={() => setGrade(g)}
          >
            {g} класс
          </Button>
        ))}
      </div>

      {/* Roadmap sections */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {sections.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${color}`} />
                <h3 className="font-semibold">{label}</h3>
              </div>
              <ul className="space-y-2">
                {roadmap[key].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic opportunities for this grade */}
      {gradeOpps.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Актуальные возможности для {grade} класса
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {gradeOpps.map((opp) => (
              <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-4 pb-4">
                    <Badge variant="secondary" className="text-xs mb-2">{opp.category}</Badge>
                    <p className="font-medium text-sm line-clamp-2">{opp.title}</p>
                    {opp.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        до {new Date(opp.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Button variant="outline" asChild>
            <Link href="/opportunities">
              Все возможности <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
