"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Info, Loader2, X } from "lucide-react";

type CourseOption = { id: number; title: string; level: string };

type FormValues = {
  courseId: string;
  offerName: string;
  academicTerm: string;
  modality: string;
  durationType: "calendar_period" | "workload";
  durationUnit: "monthly" | "bimonthly" | "quarterly" | "semester" | "annual" | "hours";
  durationValue: string;
  workloadHours: string;
  classDays: string;
  classTime: string;
};

const initialValues: FormValues = {
  courseId: "",
  offerName: "",
  academicTerm: "2026.2",
  modality: "Remota",
  durationType: "calendar_period",
  durationUnit: "monthly",
  durationValue: "1",
  workloadHours: "40",
  classDays: "",
  classTime: "",
};

const periodLabels = { monthly: "mês", bimonthly: "bimestre", quarterly: "trimestre", semester: "semestre", annual: "ano", hours: "horas" };

export function InternalClassCreatePanel({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("course");

  const selectedCourse = courses.find((course) => String(course.id) === values.courseId);
  const durationSummary = useMemo(() => {
    if (values.durationType === "workload") return `${values.workloadHours || "0"} horas de aprendizagem`;
    return `${values.durationValue || "1"} ${periodLabels[values.durationUnit]}`;
  }, [values.durationType, values.durationUnit, values.durationValue, values.workloadHours]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function toggleSection(section: string) {
    setOpenSection((current) => current === section ? null : section);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!values.courseId) return setError("Selecione o curso que será a base desta turma.");
    if (!values.offerName.trim()) return setError("Informe um nome para a turma.");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/course-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: Number(values.courseId), offerName: values.offerName.trim(), academicTerm: values.academicTerm.trim(), modality: values.modality,
          classDays: values.classDays.trim() || null, classTime: values.classTime.trim() || null, workloadHours: Number(values.workloadHours || 40),
          durationType: values.durationType, durationValue: Number(values.durationValue || 1), durationUnit: values.durationUnit, status: "draft",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível criar a turma interna.");
      router.push(`/professor/turmas-internas/${payload.offer.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Não foi possível criar a turma interna.");
      setIsSubmitting(false);
    }
  }

  const closePanel = () => router.push("/professor/turmas-internas");
  const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10";
  const sectionClass = "rounded-2xl border border-border/80 bg-background/65 p-4 shadow-sm sm:p-5";

  return <section className="surface-card overflow-hidden border-red-200/80 bg-gradient-to-br from-red-50/80 via-card to-card p-0 shadow-sm dark:border-red-950/60 dark:from-red-950/20" aria-labelledby="create-internal-class-title">
    <div className="border-b border-red-100/80 px-5 py-5 sm:px-7 sm:py-6 dark:border-red-950/50">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Novo registro interno</p><h2 id="create-internal-class-title" className="mt-1 text-2xl font-black tracking-tight text-foreground">Criar turma interna</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Configure uma oferta acadêmica dentro da plataforma. Você poderá ajustar alunos, materiais e conteúdo depois.</p></div>
        <button type="button" onClick={closePanel} aria-label="Fechar formulário de nova turma" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><X size={18} aria-hidden="true" /></button>
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-muted-foreground"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">1</span><span>Configuração</span><span className="h-px w-8 bg-border" /><span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border">2</span><span>Gestão pós-criação</span></div>
    </div>
    <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:p-7">
      <div className={sectionClass}><button type="button" onClick={() => toggleSection("course")} className="flex w-full items-center justify-between text-left"><span><span className="text-xs font-black uppercase tracking-[0.14em] text-red-600">01 · Base acadêmica</span><span className="mt-1 block text-base font-black text-foreground">Qual curso dará origem à turma?</span></span><ChevronDown className={`transition ${openSection === "course" ? "rotate-180" : ""}`} size={18} /></button>{openSection === "course" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-foreground sm:col-span-2">Curso base<select name="courseId" value={values.courseId} onChange={(event) => update("courseId", event.target.value)} className={inputClass} required><option value="" disabled>{courses.length ? "Selecione um curso existente" : "Nenhum curso disponível"}</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.level}</option>)}</select></label>{selectedCourse && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-800 dark:bg-red-950/30 dark:text-red-200"><Info size={15} className="mt-0.5 shrink-0" />A turma usará o conteúdo e a estrutura de {selectedCourse.title}. A criação não copia alunos nem cria uma turma externa.</p>}</div>}</div>
      <div className={sectionClass}><button type="button" onClick={() => toggleSection("identity")} className="flex w-full items-center justify-between text-left"><span><span className="text-xs font-black uppercase tracking-[0.14em] text-red-600">02 · Identidade</span><span className="mt-1 block text-base font-black text-foreground">Como os alunos reconhecerão esta turma?</span></span><ChevronDown className={`transition ${openSection === "identity" ? "rotate-180" : ""}`} size={18} /></button>{openSection === "identity" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-foreground">Nome da turma<input name="offerName" value={values.offerName} onChange={(event) => update("offerName", event.target.value)} maxLength={180} placeholder="Ex.: Inglês B1 — noite" className={inputClass} required /></label><label className="text-sm font-bold text-foreground">Período acadêmico<input name="academicTerm" value={values.academicTerm} onChange={(event) => update("academicTerm", event.target.value)} maxLength={80} placeholder="Ex.: 2026.2" className={inputClass} required /></label><label className="text-sm font-bold text-foreground sm:col-span-2">Modalidade<select name="modality" value={values.modality} onChange={(event) => update("modality", event.target.value)} className={inputClass}><option>Remota</option><option>Presencial</option><option>Híbrida</option></select></label></div>}</div>
      <div className={sectionClass}><button type="button" onClick={() => toggleSection("duration")} className="flex w-full items-center justify-between text-left"><span><span className="text-xs font-black uppercase tracking-[0.14em] text-red-600">03 · Duração</span><span className="mt-1 block text-base font-black text-foreground">Defina o ritmo de aprendizagem</span></span><ChevronDown className={`transition ${openSection === "duration" ? "rotate-180" : ""}`} size={18} /></button>{openSection === "duration" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-foreground">Formato<select name="durationType" value={values.durationType} onChange={(event) => update("durationType", event.target.value as FormValues["durationType"])} className={inputClass}><option value="calendar_period">Período de calendário</option><option value="workload">Carga horária</option></select></label>{values.durationType === "calendar_period" ? <label className="text-sm font-bold text-foreground">Unidade<select name="durationUnit" value={values.durationUnit} onChange={(event) => update("durationUnit", event.target.value as FormValues["durationUnit"])} className={inputClass}><option value="monthly">Mensal</option><option value="bimonthly">Bimestral</option><option value="quarterly">Trimestral</option><option value="semester">Semestral</option><option value="annual">Anual</option></select></label> : <label className="text-sm font-bold text-foreground">Horas<input name="workloadHours" value={values.workloadHours} onChange={(event) => update("workloadHours", event.target.value)} type="number" min="1" max="1000" step="1" className={inputClass} /></label>}<label className="text-sm font-bold text-foreground">Quantidade de unidades<input name="durationValue" value={values.durationValue} onChange={(event) => update("durationValue", event.target.value)} type="number" min="1" step="1" className={inputClass} /></label><div className="flex items-end rounded-xl border border-dashed border-red-200 bg-red-50/60 px-3.5 py-3 text-sm font-bold text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{durationSummary}</div></div>}</div>
      <div className={sectionClass}><button type="button" onClick={() => toggleSection("schedule")} className="flex w-full items-center justify-between text-left"><span><span className="text-xs font-black uppercase tracking-[0.14em] text-red-600">04 · Agenda</span><span className="mt-1 block text-base font-black text-foreground">Quando as aulas acontecem?</span></span><ChevronDown className={`transition ${openSection === "schedule" ? "rotate-180" : ""}`} size={18} /></button>{openSection === "schedule" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-foreground">Dias de aula<input name="classDays" value={values.classDays} onChange={(event) => update("classDays", event.target.value)} placeholder="Ex.: Terças e quintas" className={inputClass} /></label><label className="text-sm font-bold text-foreground">Horário<input name="classTime" value={values.classTime} onChange={(event) => update("classTime", event.target.value)} placeholder="Ex.: 19h às 21h" className={inputClass} /></label></div>}</div>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-100 px-3 py-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"><Info size={17} className="mt-0.5 shrink-0" />{error}</p>}
      <div className="flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">A turma será criada como rascunho. Você poderá publicar quando estiver pronta.</p><div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={closePanel} className="min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-background">Cancelar</button><button type="submit" disabled={isSubmitting || courses.length === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Criando turma...</> : <><CheckCircle2 size={16} aria-hidden="true" /> Criar turma interna</>}</button></div></div>
    </form>
  </section>;
}
