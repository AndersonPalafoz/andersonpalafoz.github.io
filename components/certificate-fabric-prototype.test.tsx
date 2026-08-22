/** @vitest-environment jsdom */

import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CertificateFabricPrototype } from "./certificate-fabric-prototype";
import { CertificateWorkspaceProvider } from "./certificate-workspace-context";

describe("CertificateFabricPrototype", () => {
  it("renders the prototype header and controls correctly", () => {
    render(
      <CertificateWorkspaceProvider>
        <CertificateFabricPrototype />
      </CertificateWorkspaceProvider>
    );
    expect(screen.getByText(/Fabric\.js Engine — Réplica Avançada/i)).toBeTruthy();
    expect(screen.getByDisplayValue("Estudante Exemplo da Silva")).toBeTruthy();
    expect(screen.getByDisplayValue("English Mastery B2")).toBeTruthy();
  });
});
