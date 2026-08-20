"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

export function ExternalCourseCta({ href }: { href: string }) {
  const [redirecting, setRedirecting] = useState(false);

  return (
    <div className="mt-5 space-y-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={redirecting}
        onClick={(event) => {
          if (redirecting) {
            event.preventDefault();
            return;
          }
          setRedirecting(true);
        }}
        className={`inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${redirecting ? "pointer-events-none opacity-70" : ""}`}
      >
        {redirecting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ExternalLink size={16} aria-hidden="true" />}
        {redirecting ? "Abrindo ambiente externo..." : "Acessar ambiente externo autorizado"}
      </a>
      <p className="text-xs font-semibold" role="status" aria-live="polite">
        {redirecting ? "Você será redirecionado para uma nova aba. Aguarde um instante." : "O acesso será aberto em uma nova aba."}
      </p>
    </div>
  );
}
