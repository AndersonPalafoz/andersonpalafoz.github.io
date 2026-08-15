"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Play, Download, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LessonPageClient() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        setCompleted(!completed);
        toast.success(!completed ? "Aula marcada como concluída com sucesso!" : "Aula marcada como pendente.");
      } else {
        toast.error("Erro ao atualizar progresso da aula.");
      }
    } catch {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/cursos/${courseId}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            <ChevronLeft size={20} /> Voltar ao Curso
          </Link>
          <span className="text-xs font-mono font-bold text-gray-400">Aula #{lessonId}</span>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-black rounded-3xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200 shadow-lg relative">
          <div className="text-center space-y-2">
            <Play size={48} className="mx-auto text-red-500 animate-pulse" />
            <p className="text-sm font-bold text-white">Player de Vídeo Integrado (YouTube / S3)</p>
            <p className="text-xs text-gray-400">Assista à aula completa e interaja com os materiais</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Módulo Acadêmico</span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Aula Exemplo — Estrutura e Prática</h1>
              <p className="text-sm text-gray-500 mt-1">Duração estimada: 45 minutos</p>
            </div>
            <Button
              onClick={handleToggleComplete}
              disabled={loading}
              className={`gap-2 font-bold h-12 px-6 rounded-xl ${
                completed ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              <CheckCircle2 size={18} />
              {completed ? "Aula Concluída" : "Marcar como Concluída"}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Conteúdo e Orientações da Aula</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nesta aula, estudaremos os fundamentos essenciais da disciplina, com exercícios práticos orientados pelo método ESA (Engage, Study, Activate). Utilize os materiais complementares abaixo para acompanhar o desenvolvimento.
            </p>
          </div>

          {/* Seção de Materiais de Apoio com Visualizador e Download */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Materiais de Apoio & Worksheet</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Disponível para Estudo</span>
            </div>
            <div className="grid gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Worksheet_Pratica_A1.pdf</p>
                    <p className="text-xs text-gray-500">2.4 MB • Material Oficial Autorizado</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewPdf(!previewPdf)}
                    className="border-gray-300 font-semibold gap-1.5"
                  >
                    <Eye size={14} /> {previewPdf ? "Ocultar Prévio" : "Visualizar"}
                  </Button>
                  <a
                    href="/materiais/everyday-vocabulary-b1.pdf"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-1.5">
                      <Download size={14} /> Baixar PDF
                    </Button>
                  </a>
                </div>
              </div>

              {/* Visualizador Prévio Integrado */}
              {previewPdf && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-gray-700 uppercase">Visualizador Integrado de Documento</span>
                    <a
                      href="/materiais/everyday-vocabulary-b1.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                    >
                      Abrir em nova aba <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="w-full h-96 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <iframe
                      src="/materiais/everyday-vocabulary-b1.pdf"
                      className="w-full h-full"
                      title="Visualizador de PDF"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
