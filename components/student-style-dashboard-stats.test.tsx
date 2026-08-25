/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StudentStyleDashboardStats } from "./student-style-dashboard-stats";

describe("StudentStyleDashboardStats", () => {
  afterEach(() => cleanup());

  it("exibe contexto e quatro métricas sem depender de rolagem lateral", () => {
    const { container } = render(
      <StudentStyleDashboardStats
        coursesCount={3}
        studentsCount={24}
        materialsCount={18}
        enrollmentsCount={31}
        contextLabel="Visão docente"
        contextDescription="Resumo dos seus cursos."
      />,
    );

    expect(screen.getByRole("region", { name: "Visão docente" })).toBeDefined();
    expect(screen.getByText("Resumo operacional")).toBeDefined();
    expect(screen.getByText("Resumo dos seus cursos.")).toBeDefined();
    expect(screen.getByText("Cursos publicados")).toBeDefined();
    expect(screen.getByText("31")).toBeDefined();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });

  it("preserva o estado de carregamento com rótulo contextual", () => {
    render(
      <StudentStyleDashboardStats
        coursesCount={0}
        studentsCount={0}
        materialsCount={0}
        enrollmentsCount={0}
        isLoading
        contextLabel="Governança da plataforma"
      />,
    );

    expect(screen.getByRole("region", { name: "Governança da plataforma em carregamento" })).toBeDefined();
  });
});
