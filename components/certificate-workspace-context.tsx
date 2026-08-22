"use client";

import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_CERTIFICATE_COMPOSITION,
  type CertificateComposition,
  type CertificateFieldKey,
} from "@/lib/certificate-composition";
import { BRAND_ASSETS } from "@/lib/brand-assets";

export type CertificateWorkspaceSampleData = Record<CertificateFieldKey, string>;

const DEFAULT_SAMPLE_DATA: CertificateWorkspaceSampleData = {
  studentName: "Estudante Exemplo da Silva",
  courseTitle: "English Mastery B2",
  level: "Intermediário (B1)",
  issuedAt: new Date().toLocaleDateString("pt-BR"),
  certificateCode: "AP-2026-9876",
  workloadHours: "32 horas",
  studentCpf: "123.456.789-00",
  period: "Julho a Agosto de 2026",
  coordinatorName: "Anderson Bacelar Palafoz",
  institutionName: "UFBA / IsF",
};

type CertificateWorkspaceValue = {
  composition: CertificateComposition;
  sampleData: CertificateWorkspaceSampleData;
  selectedTemplateId: string;
  includeSiteBranding: boolean;
  updateComposition: (
    updater:
      | Partial<CertificateComposition>
      | ((current: CertificateComposition) => CertificateComposition)
  ) => void;
  updateField: (key: CertificateFieldKey, value: string) => void;
  setSampleData: (data: Partial<CertificateWorkspaceSampleData>) => void;
  setSelectedTemplateId: (value: string) => void;
  setIncludeSiteBranding: (value: boolean) => void;
};

const CertificateWorkspaceContext = createContext<CertificateWorkspaceValue | null>(null);

export function CertificateWorkspaceProvider({ children }: { children: ReactNode }) {
  const [composition, setComposition] = useState<CertificateComposition>(() => ({
    ...DEFAULT_CERTIFICATE_COMPOSITION,
    fieldMappings: { ...DEFAULT_CERTIFICATE_COMPOSITION.fieldMappings },
    elements: [
      {
        id: "site-logo",
        type: "image",
        content: BRAND_ASSETS.monochrome,
        x: 70,
        y: 480,
        width: 64,
        height: 64,
        zIndex: 10,
        visible: true,
        isSiteBranding: true,
      },
    ],
  }));
  const [sampleData, setSampleDataState] = useState<CertificateWorkspaceSampleData>(
    DEFAULT_SAMPLE_DATA
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("default");
  const [includeSiteBranding, setIncludeSiteBranding] = useState(true);

  const value = useMemo<CertificateWorkspaceValue>(
    () => ({
      composition,
      sampleData,
      selectedTemplateId,
      includeSiteBranding,
      updateComposition: updater => {
        setComposition(current =>
          typeof updater === "function"
            ? updater(current)
            : { ...current, ...updater }
        );
      },
      updateField: (key, value) => {
        setSampleDataState(current => ({ ...current, [key]: value }));
      },
      setSampleData: data => {
        setSampleDataState(current => ({ ...current, ...data }));
      },
      setSelectedTemplateId,
      setIncludeSiteBranding,
    }),
    [composition, sampleData, selectedTemplateId, includeSiteBranding]
  );

  return (
    <CertificateWorkspaceContext.Provider value={value}>
      {children}
    </CertificateWorkspaceContext.Provider>
  );
}

export function useCertificateWorkspace() {
  const context = useContext(CertificateWorkspaceContext);
  if (!context) {
    throw new Error(
      "useCertificateWorkspace deve ser usado dentro de CertificateWorkspaceProvider."
    );
  }
  return context;
}
