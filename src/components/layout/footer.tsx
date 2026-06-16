import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">M</span>
              </div>
              <span>Mentoria Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Образовательная платформа для учеников 8–11 классов. Находи возможности и учись в удобном темпе.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Платформа</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/opportunities" className="hover:text-foreground transition-colors">Возможности</Link></li>
              <li><Link href="/courses" className="hover:text-foreground transition-colors">Курсы</Link></li>
              <li><Link href="/calendar" className="hover:text-foreground transition-colors">Календарь дедлайнов</Link></li>
              <li><Link href="/roadmap" className="hover:text-foreground transition-colors">Мой Roadmap</Link></li>
              <li><Link href="/leaderboard" className="hover:text-foreground transition-colors">Лидерборд</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Личный кабинет</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Mentoria</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://t.me/mentoria" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Telegram-канал</a></li>
              <li><a href="mailto:mentoriaorganization@gmail.com" className="hover:text-foreground transition-colors">mentoriaorganization@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2025 Mentoria Hub. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
