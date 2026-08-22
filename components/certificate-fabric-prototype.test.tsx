/** @vitest-environment jsdom */

import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CertificateFabricPrototype } from "./certificate-fabric-prototype";

describe("CertificateFabricPrototype", () => {
  it("renders the prototype header and controls correctly", () => {
    render(<CertificateFabricPrototype />);
    expect(screen.getByText(/Fabric\.js Engine — Réplica Avançada/i)).toBeTruthy();
    expect(screen.getByDisplayValue("Adna Caroline Vale Oliveira")).toBeTruthy();
    expect(screen.getByDisplayValue("Alfabetização e Letramento Étnico-Racial em Inglês")).toBeTruthy();
  });
});
