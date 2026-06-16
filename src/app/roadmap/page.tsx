import { createClient } from "@/lib/supabase/server";
import { RoadmapClient } from "@/components/roadmap/roadmap-client";

export default async function RoadmapPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let userGrade: number | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("grade")
      .eq("id", user.id)
      .single();
    userGrade = profile?.grade ?? null;
  }

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, title, category, deadline, grades")
    .order("deadline");

  return (
    <RoadmapClient
      initialGrade={userGrade ?? 9}
      opportunities={opportunities ?? []}
    />
  );
}
