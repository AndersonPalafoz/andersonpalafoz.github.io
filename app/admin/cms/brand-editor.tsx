"use client";

import { useState } from "react";
import { Image as ImageIcon, Check, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AVAILABLE_LOGOS = [
  { name: "Logo Horizontal Padrão", url: "/logo-horizontal.png" },
  { name: "Versão Vertical", url: "/Vertical.png" },
  { name: "Favicon V1", url: "/Favicon-v1.png" },
  { name: "Favicon V2", url: "/Favicon-v2.png" },
  { name: "Horizontal V1", url: "/Horizontal-v1.png" },
  { name: "Versão Monocromática", url: "/monocromatica.png" },
];

export function BrandEditor() {
  const [selectedLogo, setSelectedLogo] = useState("/logo-horizontal.png");
  const [customUrl, setCustomUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveLogo = async () => {
    const finalUrl = customUrl.trim() || selectedLogo;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey: "brand",
          sectionKey: "site_logo_url",
          title: "Logotipo Principal do Site",
          content: finalUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar logo.");
      toast.success("Logotipo atualizado com sucesso em todo o site!");
      window.dispatchEvent(new Event("brand:logo-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar logotipo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <ImageIcon className="text-red-600" size={20} /> Seletor Visual de Logotipo
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Clique em qualquer uma das opções oficiais abaixo ou cole o link de uma imagem externa para alterar a identidade visual do site instantaneamente.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {AVAILABLE_LOGOS.map((logo) => {
          const isSelected = selectedLogo === logo.url && !customUrl;
          return (
            <button
              key={logo.url}
              type="button"
              onClick={() => { setSelectedLogo(logo.url); setCustomUrl(""); }}
              className={`relative flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"}`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center">
                  <Check size={12} />
                </span>
              )}
              <div className="h-16 w-full flex items-center justify-center bg-white rounded-lg p-2 border border-gray-100 mb-3 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.url} alt={logo.name} className="max-h-12 max-w-full object-contain" />
              </div>
              <span className="text-xs font-bold text-gray-800 text-center">{logo.name}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <label className="block text-xs font-bold text-gray-700 uppercase">Ou insira a URL de uma imagem personalizada</label>
        <div className="flex gap-3">
          <Input
            placeholder="https://exemplo.com/sua-logo.png"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
          />
          <Button onClick={handleSaveLogo} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 rounded-xl shrink-0 gap-2">
            {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            Aplicar Logo
          </Button>
        </div>
      </div>
    </div>
  );
}
