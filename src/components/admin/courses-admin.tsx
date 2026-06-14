"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Course } from "@/lib/types";
import { LEVELS } from "@/lib/types";

const empty = { title: "", description: "", level: "Начальный", tags: "" };

export function CoursesAdmin({ initialData }: { initialData: (Course & { lessons?: { id: string }[] })[] }) {
  const [items, setItems] = useState(initialData);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const openCreate = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (item: Course) => {
    setForm({ title: item.title, description: item.description ?? "", level: item.level, tags: item.tags?.join(", ") ?? "" });
    setEditId(item.id); setOpen(true);
  };

  const save = async () => {
    setLoading(true);
    const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    if (editId) {
      const { data } = await supabase.from("courses").update(payload).eq("id", editId).select().single();
      if (data) setItems(items.map(i => i.id === editId ? { ...data, lessons: items.find(x => x.id === editId)?.lessons } : i));
    } else {
      const { data } = await supabase.from("courses").insert(payload).select().single();
      if (data) setItems([{ ...data, lessons: [] }, ...items]);
    }
    setOpen(false); setLoading(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить курс со всеми уроками?")) return;
    await supabase.from("courses").delete().eq("id", id);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground text-sm">{items.length} курсов</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Добавить курс</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Редактировать" : "Добавить"} курс</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div><Label>Название *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Описание</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div>
                <Label>Уровень</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div><Label>Теги (через запятую)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
              <Button className="w-full" onClick={save} disabled={!form.title || loading}>
                {loading ? "Сохраняем..." : "Сохранить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{item.level}</Badge>
                    <span className="text-xs text-muted-foreground">{item.lessons?.length ?? 0} уроков</span>
                  </div>
                  <p className="font-medium">{item.title}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
