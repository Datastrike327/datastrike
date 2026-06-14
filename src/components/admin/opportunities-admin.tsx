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
import type { Opportunity } from "@/lib/types";
import { CATEGORIES, FORMATS } from "@/lib/types";

const empty = { title: "", category: "STEM", format: "Онлайн", deadline: "", description: "", requirements: "", tags: "", apply_url: "" };

export function OpportunitiesAdmin({ initialData }: { initialData: Opportunity[] }) {
  const [items, setItems] = useState(initialData);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const openCreate = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (item: Opportunity) => {
    setForm({ title: item.title, category: item.category, format: item.format, deadline: item.deadline ?? "", description: item.description ?? "", requirements: item.requirements ?? "", tags: item.tags?.join(", ") ?? "", apply_url: item.apply_url ?? "" });
    setEditId(item.id); setOpen(true);
  };

  const save = async () => {
    setLoading(true);
    const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), deadline: form.deadline || null };
    if (editId) {
      const { data } = await supabase.from("opportunities").update(payload).eq("id", editId).select().single();
      if (data) setItems(items.map(i => i.id === editId ? data : i));
    } else {
      const { data } = await supabase.from("opportunities").insert(payload).select().single();
      if (data) setItems([data, ...items]);
    }
    setOpen(false); setLoading(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить возможность?")) return;
    await supabase.from("opportunities").delete().eq("id", id);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground text-sm">{items.length} записей</p>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
      <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Редактировать" : "Добавить"} возможность</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              {[["title", "Название *"], ["description", "Описание"], ["requirements", "Требования"], ["apply_url", "Ссылка на заявку"], ["tags", "Теги (через запятую)"]].map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Категория</Label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Формат</Label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                    {FORMATS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>Дедлайн</Label>
                <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
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
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    <Badge variant="outline" className="text-xs">{item.format}</Badge>
                    {item.deadline && <span className="text-xs text-muted-foreground">до {new Date(item.deadline).toLocaleDateString("ru-RU")}</span>}
                  </div>
                  <p className="font-medium truncate">{item.title}</p>
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
