import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCertificates } from "@/lib/db";
import { Award, Download, Linkedin, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function CertificadosPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");
  const certificados =
    !isNaN(userId) && userId > 0 ? await getCertificates(userId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificados</h1>
        <p className="text-gray-600">
          Seus certificados de conclusão de cursos
        </p>
      </div>

      {certificados.length > 0 ? (
        <div className="space-y-3">
          {certificados.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-xl border border-gray-200 bg-white space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Award className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {cert.course?.title ?? "Curso"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Concluído em{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nível</p>
                  <p className="font-semibold text-gray-900">{cert.level}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Número do Certificado</p>
                  <p className="font-semibold text-gray-900">{cert.certificateCode || `CERT-${cert.id.toString().padStart(6, "0")}`}</p>
                </div>
              </div>

              {cert.certificateUrl ? (
                <div className="space-y-2">
                  <a href={cert.certificateUrl} download target="_blank" rel="noopener noreferrer" className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium inline-flex items-center justify-center gap-2">
                    <Download size={16} /> Baixar certificado em PDF
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cert.certificateUrl)}`} target="_blank" rel="noopener noreferrer" className="w-full border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 py-2.5 rounded-lg font-medium inline-flex items-center justify-center gap-2">
                    <Linkedin size={16} /> Compartilhar no LinkedIn
                  </a>
                  <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1"><ShieldCheck size={13} className="text-emerald-600" /> PDF emitido automaticamente ao concluir 100% do curso</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">Arquivo do certificado ainda não disponível.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">
            Você ainda não tem certificados
          </p>
          <Link href="/dashboard/cursos">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold">
              Ver Meus Cursos
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
