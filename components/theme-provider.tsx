"use client";

import type { ReactNode } from "react";

/**
 * Provider compatível com a arquitetura atual de tema da plataforma.
 *
 * A restauração do tema acontece de forma síncrona no <head> do layout e a
 * Navbar aplica as mudanças posteriores. Não usamos outro storage key ou
 * outro gerenciador de classes aqui, evitando que um provider concorrente
 * reescreva o tema entre o primeiro paint e a hidratação.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return children;
}
