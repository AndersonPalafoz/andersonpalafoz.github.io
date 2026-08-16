import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement("a", { ...props, href }, children),
}));

import SobrePage, { metadata } from "./page";

describe("SobrePage server rendering", () => {
  it("renders the redesigned about page with verified academic and professional details", () => {
    const markup = renderToStaticMarkup(React.createElement(SobrePage));

    expect(markup).toContain("Anderson Bacelar Palafoz");
    expect(markup).toContain("Universidade Federal da Bahia (UFBA)");
    expect(markup).toContain("Licenciatura em Letras com Inglês");
    expect(markup).toContain("Bacharelado em Inglês");
    expect(markup).toContain("Linha do Tempo Profissional");
    expect(markup).toContain("Áreas de Pesquisa e Interesse");
    expect(markup).toContain("Filosofia de Ensino Baseada em Objetivos Claros");
  });

  it("exports correct runtime metadata", () => {
    expect(metadata.title).toContain("Anderson Bacelar Palafoz");
    expect(metadata.alternates?.canonical).toBe("/sobre");
  });
});
