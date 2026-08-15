"use client";

import { useState } from "react";
import { Receipt, Download, RefreshCw, CheckCircle2, Printer, Search, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PurchasesAndSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "subscriptions">("purchases");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [purchases] = useState([
    {
      id: "ORD-98421",
      courseName: "English Mastery A1–B2 Complete Suite",
      amountNum: 497.0,
      amount: "R$ 497,00",
      date: "14 de Agosto de 2026",
      dateObj: new Date("2026-08-14"),
      status: "Aprovado",
      paymentMethod: "Cartão de Crédito (Stripe)",
    },
    {
      id: "ORD-87123",
      courseName: "Business English & Professional Fluency",
      amountNum: 297.0,
      amount: "R$ 297,00",
      date: "02 de Julho de 2026",
      dateObj: new Date("2026-07-02"),
      status: "Aprovado",
      paymentMethod: "PIX / Stripe",
    },
    {
      id: "ORD-76211",
      courseName: "Grammar & Morphology Intensive",
      amountNum: 197.0,
      amount: "R$ 197,00",
      date: "20 de Maio de 2026",
      dateObj: new Date("2026-05-20"),
      status: "Aprovado",
      paymentMethod: "Cartão de Débito",
    },
  ]);

  const [subscriptions, setSubscriptions] = useState([
    {
      id: "SUB-55412",
      planName: "Mentoria em Grupo & Speaking Club (Mensal)",
      amount: "R$ 97,00 / mês",
      nextBilling: "14 de Setembro de 2026",
      status: "Ativa",
      cardLast4: "4242",
    },
  ]);

  const handleCancelSubscription = (subId: string) => {
    if (confirm("Tem certeza que deseja cancelar sua assinatura recorrente?")) {
      setSubscriptions(subscriptions.map(s => s.id === subId ? { ...s, status: "Cancelada" } : s));
      toast.success("Assinatura cancelada com sucesso.");
    }
  };

  const handleDownloadReceipt = (orderId: string) => {
    toast.success(`Abrindo recibo detalhado para ${orderId}...`);
    window.open(`/pagamento/recibo/${orderId}`, "_blank");
  };

  const handleExportCSV = () => {
    const headers = "ID,Curso,Valor,Data,Status,Metodo\n";
    const rows = filteredPurchases.map(p => `"${p.id}","${p.courseName}","${p.amount}","${p.date}","${p.status}","${p.paymentMethod}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_compras_anderson_palafoz_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Histórico exportado em CSV com sucesso!");
  };

  const handleExportPDF = () => {
    toast.success("Preparando visualização para impressão em PDF...");
    window.print();
  };

  const filteredPurchases = purchases
    .filter(item => item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc" ? b.dateObj.getTime() - a.dateObj.getTime() : a.dateObj.getTime() - b.dateObj.getTime();
      } else {
        return sortOrder === "desc" ? b.amountNum - a.amountNum : a.amountNum - b.amountNum;
      }
    });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Histórico de Compras e Assinaturas</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gerencie seus pagamentos, faturas, recibos e assinaturas ativas na plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "purchases" && (
            <>
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2 font-semibold border-gray-300">
                <Download size={14} /> Exportar CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2 font-semibold border-gray-300">
                <Printer size={14} /> Imprimir / PDF
              </Button>
            </>
          )}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("purchases")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "purchases" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Minhas Compras ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "subscriptions" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Assinaturas Ativas ({subscriptions.filter(s => s.status === "Ativa").length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "purchases" && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por nome do curso ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-300"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Filter size={14} /> Ordenar por:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="date">Data do Pedido</option>
              <option value="amount">Valor do Pedido</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="h-9 px-3 border-gray-300 font-bold gap-1"
            >
              <ArrowUpDown size={14} /> {sortOrder === "desc" ? "Decrescente" : "Crescente"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "purchases" ? (
        <div className="space-y-4">
          <div className="grid gap-4">
            {filteredPurchases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                Nenhuma compra encontrada para os critérios de busca.
              </div>
            ) : (
              filteredPurchases.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                      <Receipt size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-gray-400">{item.id}</span>
                      <h3 className="font-bold text-gray-900 text-base">{item.courseName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>Data: {item.date}</span>
                        <span>•</span>
                        <span>{item.paymentMethod}</span>
                        <span>•</span>
                        <span className="text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <span className="font-extrabold text-lg text-gray-900">{item.amount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(item.id)}
                      className="gap-2 border-gray-300 font-semibold"
                    >
                      <Download size={14} /> Recibo Detalhado
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-400">{sub.id}</span>
                    <h3 className="font-bold text-gray-900 text-base">{sub.planName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>Próxima Cobrança: {sub.nextBilling}</span>
                      <span>•</span>
                      <span>Cartão terminado em {sub.cardLast4}</span>
                      <span>•</span>
                      <span className={`font-bold ${sub.status === "Ativa" ? "text-green-600" : "text-red-600"}`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <span className="font-extrabold text-lg text-gray-900">{sub.amount}</span>
                  {sub.status === "Ativa" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSubscription(sub.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                    >
                      Cancelar Assinatura
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
