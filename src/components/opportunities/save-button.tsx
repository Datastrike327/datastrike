"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";

export function SaveButton({ oppId, userId, initialSaved }: { oppId: string; userId: string | null; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const toggle = async () => {
    if (!userId) return;
    setLoading(true);
    if (saved) {
      await supabase.from("saved_opportunities").delete().eq("user_id", userId).eq("opportunity_id", oppId);
    } else {
      await supabase.from("saved_opportunities").insert({ user_id: userId, opportunity_id: oppId });
    }
    setSaved(!saved);
    setLoading(false);
  };

  if (!userId) {
    return (
      <Button variant="outline" className="w-full" asChild>
        <Link href="/auth/login"><Bookmark className="w-4 h-4 mr-2" />Войди чтобы сохранить</Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" className="w-full" onClick={toggle} disabled={loading}>
      {saved ? <BookmarkCheck className="w-4 h-4 mr-2 text-primary" /> : <Bookmark className="w-4 h-4 mr-2" />}
      {saved ? "Сохранено" : "Сохранить"}
    </Button>
  );
}
