import React, { useState } from "react";
import { Target, Plus, Trash2, Edit3, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminMission {
  id: string;
  title: string;
  reward: number;
  type: "standard" | "speaking";
  active: boolean;
}

const initialMissions: AdminMission[] = [
  { id: "m1", title: "Completar o Quiz diário de B1", reward: 50, type: "standard", active: true },
  { id: "m2", title: "Gravar desafio de Speaking com IA", reward: 100, type: "speaking", active: true },
  { id: "m3", title: "Marcar 1 material como concluído na biblioteca", reward: 40, type: "standard", active: true },
];

export function MissionManager() {
  const [missions, setMissions] = useState<AdminMission[]>(initialMissions);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState(50);
  const [type, setType] = useState<"standard" | "speaking">("standard");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      setMissions((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, title, reward: Number(reward), type } : m))
      );
      toast.success("Missão diária atualizada com sucesso!");
      setEditingId(null);
    } else {
      const newMission: AdminMission = {
        id: String(Date.now()),
        title,
        reward: Number(reward),
        type,
        active: true,
      };
      setMissions([newMission, ...missions]);
      toast.success("Nova missão diária criada para os alunos!");
    }

    setTitle("");
    setReward(50);
    setType("standard");
  };

  const handleEdit = (m: AdminMission) => {
    setEditingId(m.id);
    setTitle(m.title);
    setReward(m.reward);
    setType(m.type);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Deseja realmente remover esta missão diária?")) return;
    setMissions((prev) => prev.filter((m) => m.id !== id));
    toast.success("Missão removida com sucesso.");
  };

  const toggleActive = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
    toast.success("Status da missão alterado.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="text-red-600" size={20} /> Gerenciador de Missões Diárias dos Alunos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Crie, edite e configure missões e desafios que concedem XP bônus na Área do Aluno.</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3.5 py-2 rounded-2xl">
            <Sparkles size={16} className="text-red-600" />
            <span className="text-xs font-bold text-red-700 dark:text-red-300">Gamification Engine</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            {editingId ? "Editar Missão Diária" : "Cadastrar Nova Missão"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Título da Missão</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Assistir à aula 1 do Módulo B2"
                className="bg-white dark:bg-slate-900 text-xs font-semibold h-10"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Recompensa (XP)</label>
              <Input
                type="number"
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 text-xs font-semibold h-10"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-bold text-slate-500">Tipo de Missão:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "standard" | "speaking")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="standard">Padrão (Quiz / Estudo)</option>
                <option value="speaking">Speaking (Áudio / IA)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditingId(null); setTitle(""); setReward(50); setType("standard"); }}
                  className="h-10 text-xs font-bold"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-10 px-6 rounded-xl shadow-sm gap-1.5"
              >
                {editingId ? "Atualizar Missão" : <><Plus size={15} /> Adicionar Missão</>}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Missões Ativas na Plataforma</h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {missions.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${m.active ? "bg-red-50 dark:bg-red-950/60 text-red-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                    <Gift size={18} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{m.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="font-bold text-amber-600">+{m.reward} XP</span> • Tipo: {m.type === "speaking" ? "Speaking com IA" : "Padrão"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(m.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition ${m.active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}
                  >
                    {m.active ? "Ativa" : "Pausada"}
                  </button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(m)} className="h-8 w-8 p-0 border-slate-200 dark:border-slate-700">
                    <Edit3 size={13} className="text-red-600" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(m.id)} className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
