// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BlogMarkdownPreview from "./blog-markdown-preview";

describe("BlogMarkdownPreview", () => {
  it("renderiza o conteúdo Markdown atual e remove scripts do preview", () => {
    render(
      <BlogMarkdownPreview
        title="Morfologia aplicada"
        category="Linguística & Ensino"
        readingTime={6}
        markdown={'## Subtítulo\n\n**Texto importante**\n\n<script>alert("não executar")</script>'}
      />,
    );

    expect(screen.getByRole("heading", { name: "Morfologia aplicada" })).toBeTruthy();
    expect(screen.getByText("Texto importante")).toBeTruthy();
    expect(document.querySelector("script")).toBeNull();
  });

  it("exibe um estado honesto quando o conteúdo ainda está vazio", () => {
    render(
      <BlogMarkdownPreview title="" category="" readingTime={5} markdown="" />,
    );

    expect(screen.getByText("O conteúdo digitado aparecerá aqui em tempo real.")).toBeTruthy();
    expect(screen.getByText("Título do artigo")).toBeTruthy();
  });
});
