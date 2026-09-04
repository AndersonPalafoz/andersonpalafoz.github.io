"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";

const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/dashboard",
  "/professor",
  "/aluno",
  "/login",
  "/cadastro",
  "/primeiro-acesso",
  "/redefinir-senha",
];

export function PrivacyAwareSpeedInsights() {
  return (
    <SpeedInsights
      sampleRate={0.5}
      beforeSend={(event) => {
        const pathname = new URL(event.url, window.location.origin).pathname;
        const isPrivateRoute = PRIVATE_ROUTE_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        );
        return isPrivateRoute ? null : event;
      }}
    />
  );
}
