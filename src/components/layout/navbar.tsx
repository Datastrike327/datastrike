"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, BookOpen, Trophy, LayoutDashboard, LogOut, Settings, User, Calendar, Map } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/opportunities", label: "Возможности", icon: Trophy },
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/calendar", label: "Календарь", icon: Calendar },
  { href: "/roadmap", label: "Roadmap", icon: Map },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">M</span>
          </div>
          <span>Mentoria Hub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith(href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:flex">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Кабинет
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-xs font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 select-none">
                  {initials}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <User className="w-4 h-4 mr-2" />Мой кабинет
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Settings className="w-4 h-4 mr-2" />Админ-панель
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Регистрация</Link>
              </Button>
            </div>
          )}

          {/* Mobile burger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className={cn("md:hidden", buttonVariants({ variant: "ghost", size: "sm" }))}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-base font-medium py-2"
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-base font-medium py-2">
                      <LayoutDashboard className="w-5 h-5" />Мой кабинет
                    </Link>
                    <button onClick={handleSignOut} className="flex items-center gap-3 text-base font-medium py-2 text-destructive">
                      <LogOut className="w-5 h-5" />Выйти
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button asChild variant="outline">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>Войти</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>Регистрация</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
