"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function EnrollButton({ courseId, userId }: { courseId: string; userId: string | null }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const enroll = async () => {
    if (!userId) return;
    setLoading(true);
    await supabase.from("enrollments").upsert({ user_id: userId, course_id: courseId, progress: 0 });
    toast.success("Вы записаны на курс! Приступайте к первому уроку.");
    router.refresh();
    setLoading(false);
  };

  if (!userId) {
    return (
      <Button className="w-full" asChild>
        <Link href="/auth/login"><Play className="w-4 h-4 mr-2" />Войди чтобы начать</Link>
      </Button>
    );
  }

  return (
    <Button className="w-full" onClick={enroll} disabled={loading}>
      <Play className="w-4 h-4 mr-2" />
      {loading ? "Записываемся..." : "Записаться на курс"}
    </Button>
  );
}
