"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bold, ChevronLeft, Heading2, ImagePlus, Italic, List, Loader2, Save, Strikethrough, Underline } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Course { id: number; title: string; level: string; }
interface Activity { id: number; courseId: number; title: string; description: string | null; type: string; dueDate: string | null; courseTitle: string; }
const toolbarItems = [
  { command: "bold", label: "Negrito", icon: Bold },
  { command: "italic", label: "Itálico", icon: Italic },
  { command: "underline", label: "Sublinhado", icon: Underline },
  { command: "strikeThrough", label: "Riscado", icon: Strikethrough },
  { command: "insertUnorderedList", label: "Lista", icon: List },
];

export default function AdminAvaliacoesPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"quiz" | "exercise" | "assignment" | "speaking">("quiz");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [courseResponse, activityResponse] = await Promise.all([fetch("/api/courses", { cache: "no-store" }), fetch("/api/admin/activities", { cache: "no-store" })]);
      const coursePayload = await courseResponse.json();
      const activityPayload = await activityResponse.json();
      if (!courseResponse.ok) throw new Error(coursePayload.error || "Não foi possível carregar os cursos.");
      if (!activityResponse.ok) throw new Error(activityPayload.error || "Não foi possível carregar as avaliações.");
      setCourses(coursePayload.courses || []);
      setActivities(activityPayload.activities || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar a página.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const applyCommand = (command: string) => { editorRef.current?.focus(); document.execCommand(command, false); };
  const applyHeading = () => { editorRef.current?.focus(); document.execCommand("formatBlock", false, "h3"); };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione um arquivo de imagem."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 5 MB."); return; }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "assessment-image");
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível enviar a imagem.");
      editorRef.current?.focus();
      document.execCommand("insertImage", false, payload.url);
      toast.success("Imagem inserida no enunciado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const description = editorRef.current?.innerHTML || "";
    if (!courseId || !title.trim() || !description.replace(/<[^>]+>/g, "").trim()) {
      toast.error("Selecione o curso, informe o título e escreva o enunciado.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch("/api/admin/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: Number(courseId), title, description, type, dueDate: dueDate || undefined }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar a avaliação.");
      toast.success("Prova ou atividade criada com conteúdo formatado.");
      setTitle(""); setCourseId(""); setDueDate("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a avaliação.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600"><ChevronLeft size={16} /> Painel administrativo</Link><h1 className="text-3xl font-black tracking-tight text-gray-950">Provas e atividades</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Crie questões com formatação visual, imagens de apoio, associação a cursos e prazo de entrega.</p></div></header>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] sm:px-6">
        <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-red-600">Nova avaliação</p><h2 className="mt-1 text-xl font-black text-gray-950">Editor de questão</h2></div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Curso<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"><option value="">Selecione um curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} — {course.level}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-gray-700">Título<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Quiz — Simple Present" className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label><label className="block text-sm font-bold text-gray-700">Tipo<select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-red-500"><option value="quiz">Quiz</option><option value="exercise">Exercício</option><option value="assignment">Tarefa</option><option value="speaking">Speaking</option></select></label></div>
            <label className="block text-sm font-bold text-gray-700">Prazo (opcional)<input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-normal outline-none focus:border-red-500" /></label>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-gray-300 bg-gray-50 p-2"><button type="button" onClick={applyHeading} aria-label="Título da questão" title="Título da questão" className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-red-600"><Heading2 size={17} /></button>{toolbarItems.map(({ command, label, icon: Icon }) => <button key={command} type="button" onClick={() => applyCommand(command)} aria-label={label} title={label} className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-red-600"><Icon size={17} /></button>)}<span className="mx-1 h-5 w-px bg-gray-300" /><button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} aria-label="Inserir imagem" title="Inserir imagem" className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-600 hover:bg-white hover:text-red-600 disabled:opacity-50"><ImagePlus size={17} /> <span className="hidden text-xs font-bold sm:inline">{uploadingImage ? "Enviando..." : "Imagem"}</span></button><input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" /></div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-label="Enunciado formatado da questão" data-placeholder="Escreva o enunciado, inclua exemplos, instruções, alternativas e imagens..." className="min-h-56 rounded-b-xl border border-gray-300 p-4 text-sm leading-7 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 [&:empty]:before:text-gray-400 [&:empty]:before:content-[attr(data-placeholder)]" />
              <p className="mt-2 text-xs text-gray-500">Imagens JPG, PNG, WEBP ou GIF de até 5 MB. A imagem será inserida no ponto atual do cursor.</p>
            </div>
            <Button type="submit" disabled={saving || uploadingImage} className="h-11 w-full rounded-xl bg-red-600 font-bold text-white hover:bg-red-700">{saving ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Save size={17} className="mr-2" />} Salvar prova ou atividade</Button>
          </div>
        </form>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Conteúdo publicado</p><h2 className="mt-1 text-xl font-black text-gray-950">Avaliações recentes</h2></div><div className="space-y-3">{activities.map((activity) => <article key={activity.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-black text-gray-900">{activity.title}</h3><p className="mt-1 text-xs text-gray-500">{activity.courseTitle} · {activity.type}</p></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase text-red-700">{activity.dueDate ? `Prazo ${new Date(activity.dueDate).toLocaleDateString("pt-BR")}` : "Sem prazo"}</span></div><div className="prose prose-sm mt-3 max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: activity.description || "" }} /></article>)}{activities.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">Nenhuma avaliação criada ainda.</div>}</div></section>
      </main>
    </div>
  );
}
