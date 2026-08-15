"use client";

import { useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CertificateModalProps {
  courseId: number;
  courseName: string;
  percentage: number;
}

export function CertificateModal({ courseId, courseName, percentage }: CertificateModalProps) {
  // Garantir uso de courseName para satisfazer o compilador
  const titleForDisplay = courseName;
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/certificate?courseId=${courseId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao carregar certificado");

      if (!json.eligible) {
        toast.error(`Você concluiu ${json.percentage}% do curso. O certificado é liberado automaticamente ao atingir 100%!`);
        return;
      }

      setCertData(json);
      setShowModal(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar certificado");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Button
        onClick={fetchCertificate}
        disabled={loading || percentage < 100}
        className={`w-full sm:w-auto font-bold text-sm gap-2 ${
          percentage >= 100
            ? "bg-green-600 hover:bg-green-700 text-white shadow-md animate-pulse"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Award size={18} />}
        {percentage >= 100 ? "Baixar Certificado Oficial (PDF)" : `Certificado Bloqueado (${percentage}%)`}
      </Button>

      {showModal && certData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6 border-8 border-red-600/10 print:border-none">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award size={36} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600">Anderson Palafoz Platform</span>
              <h2 className="text-3xl font-extrabold text-gray-900 font-serif">Certificado de Conclusão</h2>
              <p className="text-sm text-gray-500">Certificamos com orgulho que</p>
              <h3 className="text-2xl font-bold text-gray-900 border-b-2 border-red-200 pb-2 inline-block px-6">
                {certData.studentName}
              </h3>
              <p className="text-sm text-gray-600 pt-2">
                concluiu com êxito o programa de ensino de inglês e capacitação acadêmica correspondente ao curso:
              </p>
              <h4 className="text-xl font-bold text-red-700">{titleForDisplay}</h4>
              <p className="text-xs text-gray-400 pt-2">Ministrado pelo Prof. {certData.instructor}</p>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div>
                <p>Data de Emissão: {certData.issueDate}</p>
                <p className="font-mono mt-0.5">Código: {certData.certificateCode}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">Anderson Palafoz</p>
                <p>Professor Titular e Pesquisador</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 print:hidden">
              <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2">
                <Download size={16} /> Imprimir / Salvar PDF
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="text-xs">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
