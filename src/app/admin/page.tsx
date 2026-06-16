import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunitiesAdmin } from "@/components/admin/opportunities-admin";
import { CoursesAdmin } from "@/components/admin/courses-admin";
import { UsersAdmin } from "@/components/admin/users-admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const [
    { data: opportunities },
    { data: courses },
    { data: users },
    { count: enrollmentsCount },
    { count: completionsCount },
    { count: savedCount },
  ] = await Promise.all([
    supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
    supabase.from("courses").select("*, lessons(id)").order("created_at"),
    supabase.from("user_profiles").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("progress", 100),
    supabase.from("saved_opportunities").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Админ-панель</h1>
        <p className="text-muted-foreground">Управление возможностями, курсами и пользователями</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{opportunities?.length ?? 0}</div>
          <div className="text-sm text-muted-foreground">Возможностей</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{courses?.length ?? 0}</div>
          <div className="text-sm text-muted-foreground">Курсов</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{users?.length ?? 0}</div>
          <div className="text-sm text-muted-foreground">Пользователей</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{enrollmentsCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Записей на курсы</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{completionsCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Завершили курс</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{savedCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Сохранений</div>
        </div>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList className="mb-6">
          <TabsTrigger value="opportunities">Возможности</TabsTrigger>
          <TabsTrigger value="courses">Курсы</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities">
          <OpportunitiesAdmin initialData={opportunities ?? []} />
        </TabsContent>
        <TabsContent value="courses">
          <CoursesAdmin initialData={courses ?? []} />
        </TabsContent>
        <TabsContent value="users">
          <UsersAdmin initialData={users ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
