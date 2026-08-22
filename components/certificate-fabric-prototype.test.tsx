import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CertificateFabricPrototype } from "./certificate-fabric-prototype";

describe("CertificateFabricPrototype", () => {
  it("renders the prototype header and controls correctly", () => {
    render(<CertificateFabricPrototype />);
    expect(screen.getByText(/Protótipo de Editor Visual Avançado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do Aluno/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título do Curso/i)).toBeInTheDocument();
  });
});
