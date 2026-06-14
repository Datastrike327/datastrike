"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/lib/types";

export function UsersAdmin({ initialData }: { initialData: UserProfile[] }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm mb-4">{initialData.length} пользователей</p>
      <div className="space-y-2">
        {initialData.map(user => (
          <Card key={user.id}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{user.full_name ?? "—"}</span>
                    {user.is_admin && <Badge>Админ</Badge>}
                    {user.grade && <Badge variant="outline">{user.grade} класс</Badge>}
                  </div>
                  {user.interests && user.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.interests.slice(0, 4).map(i => (
                        <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{i}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
