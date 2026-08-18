export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Inbox, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export const metadata = {
  title: "Mensagens de Contato | Painel Admin",
  description: "Gerenciamento de mensagens recebidas pelo formulário de contato do site.",
};

export default async function AdminContactMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  let messages: any[] = [];
  try {
    messages = await db.query.contactMessages.findMany({
      orderBy: desc(contactMessages.createdAt),
    });
  } catch (err) {
    console.error("Erro ao carregar mensagens de contato:", err);
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={16} /> Voltar ao Painel Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Mail className="text-red-600" size={32} />
              Mensagens do Formulário de Contato
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie todas as mensagens enviadas pelos visitantes e alunos através da página de contato.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold border border-border/70">
              {messages.length} mensagens recebidas
            </span>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Inbox size={20} className="text-red-600" />
              Caixa de Entrada
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Mail size={48} className="mx-auto text-gray-300" />
              <p className="text-muted-foreground font-medium">Nenhuma mensagem de contato recebida até o momento.</p>
              <p className="text-sm text-muted-foreground">As mensagens enviadas pelo formulário da página de contato aparecerão aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {messages.map((msg) => (
                <div key={msg.id} className="p-6 hover:bg-background transition space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        {msg.name ? msg.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base">{msg.name}</h3>
                        <p className="text-sm text-muted-foreground">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(msg.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full font-semibold ${msg.isRead ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {msg.isRead ? "Lida" : "Nova"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-4 border border-border space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                      Assunto: {msg.subject}
                    </p>
                    <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
                    >
                      <Mail size={14} /> Responder por Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
