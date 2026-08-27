"use client";

import { useState } from "react";
import { BookPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfessorCoursesList } from "@/components/professor-courses-list";

type TeacherCourse = { id: number; title: string; level: string; category?: string | null; modules?: number; isFree?: boolean; price?: number; status?: string | null };

export function TeacherCourseStudio({ initialCourses }: { initialCourses: TeacherCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", level: "A1", category: "Curso de Inglês", modules: "1", isFree: true, price: "0" });

  async function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) { toast.error("Informe o título do curso."); return; }
    try {
      setSaving(true);
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), level: form.level, category: form.category.trim() || null, modules: Math.max(0, Number(form.modules) || 0), isFree: form.isFree, price: form.isFree ? 0 : Math.max(0, Number(form.price) || 0) }),
      });
      const course = await response.json();
      if (!response.ok) throw new Error(course.error || "Não foi possível criar o curso.");
      setCourses((current) => [{ id: course.id, title: course.title, level: course.level, category: course.category, modules: course.modules ?? 0, isFree: course.isFree ?? true, price: Number(course.price ?? 0) }, ...current]);
      setForm({ title: "", level: "A1", category: "Curso de Inglês", modules: "1", isFree: true, price: "0" });
      toast.success("Curso criado. Revise o status e acrescente módulos antes de publicar.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o curso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createCourse} className="surface-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6" aria-label="Criar curso">
        <div className="sm:col-span-2"><h2 className="flex items-center gap-2 text-lg font-black text-foreground"><BookPlus className="text-red-600" size={21} /> Criar curso</h2><p className="mt-1 text-sm text-muted-foreground">Comece com o essencial; depois use a lista abaixo para revisar o status do curso.</p></div>
        <label className="text-xs font-bold text-muted-foreground">Título<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="field-control mt-1 w-full text-sm" placeholder="Ex.: English for Beginners A1" /></label>
        <label className="text-xs font-bold text-muted-foreground">Nível<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="field-control mt-1 w-full text-sm">{["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
        <label className="text-xs font-bold text-muted-foreground">Categoria<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="field-control mt-1 w-full text-sm" placeholder="Curso de Inglês" /></label>
        <label className="text-xs font-bold text-muted-foreground">Módulos iniciais<input type="number" min="0" max="100" value={form.modules} onChange={(event) => setForm({ ...form, modules: event.target.value })} className="field-control mt-1 w-full text-sm" /></label>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground"><input type="checkbox" checked={form.isFree} onChange={(event) => setForm({ ...form, isFree: event.target.checked })} className="h-4 w-4 accent-red-600" /> Curso gratuito</label>
        {!form.isFree && <label className="text-xs font-bold text-muted-foreground">Preço (R$)<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="field-control mt-1 w-full text-sm" /></label>}
        <div className="flex items-end justify-end"><Button type="submit" disabled={saving} className="min-h-11 bg-red-600 text-white hover:bg-red-700">{saving ? <Loader2 className="mr-2 animate-spin" size={16} /> : <BookPlus className="mr-2" size={16} />} Criar curso</Button></div>
      </form>
      <ProfessorCoursesList key={courses.map((course) => course.id).join(",")} initialCourses={courses} />
    </div>
  );
}
