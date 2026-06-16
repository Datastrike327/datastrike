import { createClient } from "@/lib/supabase/server";
import { OpportunitiesClient } from "@/components/opportunities/opportunities-client";

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  const { data: opportunities } = await supabase.from("opportunities").select("*").order("deadline");
  const { data: { user } } = await supabase.auth.getUser();

  let savedIds: string[] = [];
  if (user) {
    const { data } = await supabase.from("saved_opportunities").select("opportunity_id").eq("user_id", user.id);
    savedIds = data?.map(s => s.opportunity_id) ?? [];
  }

  return (
    <OpportunitiesClient
      initialOpportunities={opportunities ?? []}
      initialSaved={savedIds}
      userId={user?.id ?? null}
    />
  );
}
