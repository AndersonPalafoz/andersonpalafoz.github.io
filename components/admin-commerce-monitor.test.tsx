/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AdminCommerceMonitor, type AdminCommerceData } from "./admin-commerce-monitor";

const data: AdminCommerceData = {
  commerceAvailable: true,
  salesSummary: {
    totalPurchases: 1,
    totalRevenue: 197,
    currency: "BRL",
    revenueBasis: "current_course_price",
    uniqueBuyers: 1,
    totalEnrollments: 1,
  },
  topSellingCourses: [{ courseId: 1, title: "Curso de Inglês", purchases: 1, revenue: 197 }],
  recentPurchases: [{
    id: 10,
    courseId: 1,
    courseTitle: "Curso de Inglês",
    studentId: 3,
    studentName: "Aluno Teste",
    studentEmail: "aluno@example.com",
    amount: 197,
    status: "paid",
    purchasedAt: "2026-08-21T12:00:00.000Z",
  }],
  recentEnrollments: [{
    id: 20,
    courseId: 1,
    courseTitle: "Curso de Inglês",
    studentId: 3,
    studentName: "Aluno Teste",
    studentEmail: "aluno@example.com",
    progress: 50,
    status: "active",
    enrolledAt: "2026-08-21T12:00:00.000Z",
  }],
};

describe("AdminCommerceMonitor", () => {
  afterEach(() => cleanup());

  it("exibe vendas, curso e aluno matriculado no painel existente", () => {
    render(<AdminCommerceMonitor data={data} />);
    expect(screen.getByRole("heading", { name: /monitoramento comercial e acadêmico/i })).toBeDefined();
    expect(screen.getAllByText("Aluno Teste").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Curso de Inglês").length).toBeGreaterThan(0);
    expect(screen.getByText(/vendas pagas/i)).toBeDefined();
  });

  it("informa quando os dados comerciais estão indisponíveis sem inventar métricas", () => {
    render(<AdminCommerceMonitor data={{ ...data, commerceAvailable: false, recentPurchases: [], recentEnrollments: [], topSellingCourses: [] }} />);
    expect(screen.getByRole("alert").textContent).toMatch(/nenhum valor foi estimado ou inventado/i);
  });
});
