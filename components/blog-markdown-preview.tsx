"use client";

import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

type BlogMarkdownPreviewProps = {
  markdown: string;
  title: string;
  category: string;
  readingTime: number;
};

export function BlogMarkdownPreview({ markdown, title, category, readingTime }: BlogMarkdownPreviewProps) {
  const safeHtml = useMemo(() => {
    const source = markdown.trim() || "_O conteúdo digitado aparecerá aqui em tempo real._";
    const rendered = marked.parse(source, { gfm: true, breaks: true });
    return DOMPurify.sanitize(typeof rendered === "string" ? rendered : String(rendered), {
      USE_PROFILES: { html: true },
    });
  }, [markdown]);

  return (
    <aside aria-label="Pré-visualização do artigo" className="rounded-2xl border border-border bg-background p-5 shadow-inner sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600">Preview em tempo real</p>
          <h3 className="mt-2 break-words text-2xl font-black leading-tight text-foreground">{title.trim() || "Título do artigo"}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          {readingTime || 5} min de leitura
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">{category.trim() || "Sem categoria"}</span>
        <span aria-hidden="true">•</span>
        <span>Rascunho não publicado</span>
      </div>

      <div className="prose prose-sm max-w-none leading-7 text-foreground prose-headings:text-foreground prose-a:text-green-700 prose-blockquote:border-green-600 prose-blockquote:text-muted-foreground prose-code:rounded prose-code:bg-card prose-code:px-1 prose-code:text-foreground prose-img:rounded-xl">
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </div>
    </aside>
  );
}

export default BlogMarkdownPreview;
