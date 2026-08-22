/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CertificateLaboratoryManager } from "./certificate-laboratory-manager";
import { CertificateWorkspaceProvider } from "./certificate-workspace-context";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderLaboratory() {
  return render(
    <CertificateWorkspaceProvider>
      <CertificateLaboratoryManager />
    </CertificateWorkspaceProvider>
  );
}

describe("CertificateLaboratoryManager", () => {
  it("expõe as quatro abordagens com navegação acessível", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ certificates: [], templates: [] }),
      })
    );

    renderLaboratory();

    expect(screen.getByRole("tab", { name: /Abrir Gerador oficial/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Abrir Fabric\.js/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Abrir Konva\.js/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Abrir GrapesJS/i })).toBeTruthy();
    expect(screen.getByText("Estado sincronizado")).toBeTruthy();
  });

  it("altera a abordagem ativa sem renderizar os protótipos pesados no primeiro paint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ certificates: [], templates: [] }),
      })
    );

    renderLaboratory();
    const fabricTab = screen.getByRole("tab", { name: /Abrir Fabric\.js/i });

    expect(fabricTab.getAttribute("data-state")).toBe("inactive");
    expect(screen.queryByText(/Fabric\.js Engine/i)).toBeNull();

    fireEvent.mouseDown(fabricTab);
    fireEvent.click(fabricTab);

    await waitFor(() => expect(fabricTab.getAttribute("data-state")).toBe("active"));
  });
});
