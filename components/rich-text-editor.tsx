"use client";

import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Link as LinkIcon } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const insertTag = (tagStart: string, tagEnd: string = "") => {
    const textarea = document.getElementById("rich-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${tagStart}${selectedText || "texto"}${tagEnd}`;
    const newVal = value.substring(0, start) + replacement + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selectedText.length || 5));
    }, 50);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Barra de Ferramentas */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 px-3 py-2">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertTag("**", "**")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Negrito"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTag("*", "*")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Itálico"
            >
              <Italic size={15} />
            </button>
            <span className="h-4 w-px bg-gray-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertTag("# ")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Título 1"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTag("## ")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Título 2"
            >
              <Heading2 size={15} />
            </button>
            <span className="h-4 w-px bg-gray-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertTag("- ")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Lista com marcadores"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTag("1. ")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Lista numerada"
            >
              <ListOrdered size={15} />
            </button>
            <span className="h-4 w-px bg-gray-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertTag("> ")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Citação"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTag("[", "](https://)")}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title="Link"
            >
              <LinkIcon size={15} />
            </button>
          </div>
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${activeTab === "write" ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs" : "text-gray-600 dark:text-gray-300"}`}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${activeTab === "preview" ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs" : "text-gray-600 dark:text-gray-300"}`}
            >
              Pré-visualizar
            </button>
          </div>
        </div>

        {activeTab === "write" ? (
          <textarea
            id="rich-textarea"
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Digite o conteúdo formatado..."}
            className="w-full bg-transparent p-4 text-xs font-medium text-gray-900 dark:text-white focus:outline-none resize-y"
          />
        ) : (
          <div className="p-4 min-h-[120px] text-xs prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {value || <span className="text-gray-400 italic">Nenhum conteúdo para pré-visualizar.</span>}
          </div>
        )}
      </div>
    </div>
  );
}
