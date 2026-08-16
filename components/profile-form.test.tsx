// @vitest-environment jsdom

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileForm } from "./profile-form";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("ProfileForm avatar upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:avatar-preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("rejects unsupported image formats before making a request", () => {
    render(<ProfileForm initialName="Anderson" initialPhone="" initialLocation="" initialBio="" />);
    const input = screen.getByLabelText("Escolher foto");
    const file = new File(["svg"], "avatar.svg", { type: "image/svg+xml" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByRole("alert").textContent).toContain("JPG, PNG ou WebP");
    expect(screen.queryByRole("button", { name: "Salvar foto" })).toBeNull();
  });

  it("uploads a valid image and shows success feedback", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ user: { avatarUrl: "https://cdn.example.com/avatar.webp" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(<ProfileForm initialName="Anderson" initialPhone="" initialLocation="" initialBio="" />);
    const input = screen.getByLabelText("Escolher foto");
    const file = new File(["png"], "avatar.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar foto" }));

    expect((await screen.findByRole("button", { name: "Enviando foto..." })).hasAttribute("disabled")).toBe(true);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/user/profile");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "PUT" });
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBeInstanceOf(FormData);
    expect((await screen.findByRole("status")).textContent).toContain("Foto de perfil atualizada");
  });
});
