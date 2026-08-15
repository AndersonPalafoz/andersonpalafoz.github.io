"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, Printer, ArrowLeft, ShieldCheck, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReceiptDetailPage() {
  const params = useParams();
  const receiptId = params.id || "ORD-98421";
  const currentDate = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8 print:shadow-none print:border-none">
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-bold text-xl">
              AP
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-900">Anderson Palafoz Platform</h2>
              <p className="text-xs text-gray-500">Ensino de Inglês & Hub Acadêmico</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
              Pago & Verificado
            </span>
            <p className="text-xs text-gray-400 mt-1 font-mono">Ref: {receiptId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Recibo de Transação Comercial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-sm">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Emitente:</p>
              <p className="font-bold text-gray-900">Anderson Palafoz Educação Ltda</p>
              <p className="text-xs text-gray-600">Salvador, BA — Brasil</p>
              <p className="text-xs text-gray-600">suporte@andersonpalafoz.com</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Data da Emissão:</p>
              <p className="font-bold text-gray-900">{currentDate}</p>
              <p className="text-xs text-gray-500 font-semibold uppercase mt-2">Processamento:</p>
              <p className="font-bold text-gray-900">Stripe Secure Gateway</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-600">
                <th className="p-4">Item / Descrição</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              <tr>
                <td className="p-4">
                  <p className="font-bold text-gray-900">English Mastery A1–B2 Complete Suite</p>
                  <p className="text-xs text-gray-500">Acesso vitalício + materiais e certificado</p>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-50 text-red-700">Curso Completo</span>
                </td>
                <td className="p-4 text-right font-extrabold text-gray-900">R$ 497,00</td>
              </tr>
            </tbody>
          </table>
          <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-200 font-extrabold text-base">
            <span>Valor Total Pago:</span>
            <span className="text-red-600 text-lg">R$ 497,00</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
          <Button onClick={handlePrint} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-xl gap-2">
            <Printer size={18} /> Imprimir / Salvar PDF
          </Button>
          <Link href="/dashboard/compras" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-gray-300 gap-2">
              <ArrowLeft size={16} /> Voltar às Compras
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
