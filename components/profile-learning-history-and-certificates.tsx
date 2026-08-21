'use client';

import { useEffect, useState } from "react";
import { Award, BookOpen, CheckCircle2, Download, GraduationCap, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EnrollmentItem {
  id: number;
  progress: number;
  status: string;
  enrolledAt: string | null;
  course: {
    id: number;
    title: string;
    level: string;
    estimatedHours?: number;
  };
}

interface CertificateItem {
  id: number;
  issuedAt: string;
  level: string;
  certificateCode: string | null;
  certificateUrl: string | null;
  signedPdfUrl: string | null;
  signatureType: "none" | "manual" | "govbr" | null;
  course: {
    title: string;
  };
}

export function ProfileLearningHistoryAndCertificates() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, certRes] = await Promise.all([
          fetch("/api/user/historico", { cache: "no-store" }),
          fetch("/api/dashboard/certificados", { cache: "no-store" }).catch(() => null),
        ]);

        if (enrollRes.ok) {
          const data = await enrollRes.json();
          setEnrollments(data.enrollments || []);
        }

        // Tentar carregar certificados por rota dedicada ou fallback
        const certsData = certRes && certRes.ok ? await certRes.json() : [];
        setCertificates(Array.isArray(certsData) ? certsData : []);
      } catch (error) {
        console.error("Erro ao carregar histórico no perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4 animate-pulse">
        <div className="h-6 w-56 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-100 rounded-xl"></div>
        <div className="h-24 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seção Histórico de Aprendizado */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Histórico de Aprendizado</h3>
              <p className="text-xs text-gray-500">Cursos matriculados, andamento e progresso geral</p>
            </div>
          </div>
          <Link href="/dashboard/meus-cursos" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map((enrol) => (
              <div key={enrol.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{enrol.course?.title}</h4>
                    <p className="text-xs text-gray-500">Nível: <span className="font-semibold text-gray-700">{enrol.course?.level || "Geral"}</span></p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    enrol.progress >= 100 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {enrol.progress >= 100 ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {enrol.progress}% Concluído
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${Math.min(100, enrol.progress)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BookOpen className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600">Você ainda não se matriculou em nenhum curso.</p>
            <Link href="/cursos" className="mt-3 inline-block bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition">
              Explorar Cursos
            </Link>
          </div>
        )}
      </div>

      {/* Seção Certificados Conquistados */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Certificados e Conquistas</h3>
              <p className="text-xs text-gray-500">Baixe certificados assinados (manual ou gov.br) ao concluir 100%</p>
            </div>
          </div>
          <Link href="/dashboard/certificados" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
            Galeria completa <ArrowRight size={14} />
          </Link>
        </div>

        {certificates.length > 0 ? (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">{cert.course?.title}</h4>
                    {cert.signedPdfUrl && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <ShieldCheck size={12} /> {cert.signatureType === "govbr" ? "Assinado gov.br" : "Assinado"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Concluído em {new Date(cert.issuedAt).toLocaleDateString("pt-BR")}</p>
                </div>

                {cert.signedPdfUrl ? (
                  <a
                    href={`/api/certificates/${cert.id}/download`}
                    download
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition"
                  >
                    <Download size={14} /> Baixar PDF Assinado
                  </a>
                ) : cert.certificateUrl ? (
                  <a
                    href={cert.certificateUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition"
                  >
                    <Download size={14} /> Baixar PDF
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">Disponível em breve</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Award className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600">Nenhum certificado emitido ainda. Conclua os módulos para conquistar o seu!</p>
          </div>
        )}
      </div>
    </div>
  );
}
