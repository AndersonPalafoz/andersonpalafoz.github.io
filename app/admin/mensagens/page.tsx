"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Mail, MessageSquare, Reply, Search, Trash2, User, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";

interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt: string | null;
  repliedBy?: string | null;
  adminReply?: string | null;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/messages");
      if (!res.ok) {
        throw new Error("Falha ao carregar mensagens");
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar mensagens de contato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMessages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleToggleRead = async (id: number, currentRead: boolean) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !currentRead }),
      });
      if (res.ok) {
        setMessages((currentMessages) => currentMessages.map((m) => m.id === id ? { ...m, isRead: !currentRead, readAt: !currentRead ? new Date().toISOString() : null } : m));
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, isRead: !currentRead, readAt: !currentRead ? new Date().toISOString() : null } : null);
        }
        toast.success(!currentRead ? "Mensagem marcada como lida." : "Mensagem marcada como não lida.");
      } else {
        toast.error("Erro ao atualizar status da mensagem.");
      }
    } catch {
      toast.error("Erro de conexão ao atualizar mensagem.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) {
      toast.error("Escreva uma resposta para enviar.");
      return;
    }

    try {
      setReplying(true);
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMessage.id,
          replyText,
          subject: `Re: ${selectedMessage.subject}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
          toast.success("Resposta registrada na central administrativa.");
        setMessages(messages.map(m => m.id === selectedMessage.id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m));
        setReplyText("");
        setSelectedMessage(null);
      } else {
        toast.error(data.error || "Erro ao enviar resposta.");
      }
    } catch {
      toast.error("Erro ao enviar resposta.");
    } finally {
      setReplying(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" ? true : filterStatus === "read" ? m.isRead : !m.isRead;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

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
              <MessageSquare className="text-red-600" size={32} />
              Central de Mensagens de Contato
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize, organize e responda diretamente às mensagens enviadas pelos visitantes através da página <Link href="/contato" className="text-red-600 underline font-medium">/contato</Link>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-red-100 dark:bg-red-950/50 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-300">
              <Mail size={16} /> {unreadCount} {unreadCount === 1 ? "não lida" : "não lidas"}
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, assunto ou termo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-card-foreground outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="text-gray-500" />
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterStatus === "all" ? "bg-red-600 text-white" : "bg-card border border-border text-foreground hover:bg-muted"}`}
            >
              Todas ({messages.length})
            </button>
            <button
              onClick={() => setFilterStatus("unread")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterStatus === "unread" ? "bg-red-600 text-white" : "bg-card border border-border text-foreground hover:bg-muted"}`}
            >
              Não lidas ({unreadCount})
            </button>
            <button
              onClick={() => setFilterStatus("read")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterStatus === "read" ? "bg-red-600 text-white" : "bg-card border border-border text-foreground hover:bg-muted"}`}
            >
              Lidas ({messages.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-5 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/40 font-bold text-sm text-foreground flex items-center justify-between">
              <span>Mensagens Recebidas</span>
              <span className="text-xs text-muted-foreground">{filteredMessages.length} exibidas</span>
            </div>
            {loading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-red-600" size={24} />
                <span>Carregando mensagens...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>Nenhuma mensagem encontrada.</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.isRead) handleToggleRead(msg.id, false);
                    }}
                    className={`p-4 cursor-pointer transition hover:bg-muted/50 ${selectedMessage?.id === msg.id ? "bg-red-50/70 dark:bg-red-950/30 border-l-4 border-red-600" : ""} ${!msg.isRead ? "font-semibold bg-accent/20" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate max-w-[180px]">{msg.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground truncate mb-1">{msg.subject}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{msg.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${msg.isRead ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"}`}>
                        {msg.isRead ? "Lida" : "Nova"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{msg.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail / Reply Panel */}
          <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-border pb-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Detalhes da Mensagem</span>
                    <h2 className="text-2xl font-bold text-foreground mt-1">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground"><User size={16} className="text-red-600" /> {selectedMessage.name}</span>
                      <span className="flex items-center gap-1.5"><Mail size={16} className="text-red-600" /> <a href={`mailto:${selectedMessage.email}`} className="hover:underline text-red-600">{selectedMessage.email}</a></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.isRead)}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      {selectedMessage.isRead ? "Marcar como não lida" : "Marcar como lida"}
                    </button>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-muted-foreground hover:text-foreground text-sm font-bold px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="bg-muted/40 p-6 rounded-2xl border border-border/60 space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground block">Mensagem enviada em {new Date(selectedMessage.createdAt).toLocaleString("pt-BR")}:</span>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">{selectedMessage.message}</p>
                </div>
                {selectedMessage.adminReply && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900/60 dark:bg-green-950/20">
                    <span className="text-xs font-semibold text-green-800 dark:text-green-300 block">Resposta interna registrada{selectedMessage.repliedAt ? ` em ${new Date(selectedMessage.repliedAt).toLocaleString("pt-BR")}` : ""}:</span>
                    <p className="mt-2 text-sm leading-relaxed text-green-950 whitespace-pre-wrap dark:text-green-100">{selectedMessage.adminReply}</p>
                  </div>
                )}

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Reply size={18} className="text-red-600" /> Registrar resposta interna
                  </h3>
                  <div>
                    <label htmlFor="reply-text" className="block text-xs font-semibold text-muted-foreground mb-1">
                      Resposta para a mensagem de {selectedMessage.name} (visível no painel)
                    </label>
                    <textarea
                      id="reply-text"
                      rows={5}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva sua resposta profissional..."
                      required
                      className="w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 resize-y"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setReplyText("")}
                      className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-muted transition"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={replying || !replyText.trim()}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-red-600/20 disabled:opacity-50"
                    >
                      {replying ? <><Loader2 size={16} className="animate-spin" /> Registrando resposta...</> : <><Reply size={16} /> Registrar resposta</>}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground space-y-3">
                <MessageSquare size={48} className="mx-auto text-muted-foreground/40" />
                <h3 className="text-lg font-bold text-foreground">Nenhuma mensagem selecionada</h3>
                <p className="text-sm max-w-sm mx-auto">Selecione uma mensagem na lista ao lado para ver o conteúdo completo e registrar uma resposta interna.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
