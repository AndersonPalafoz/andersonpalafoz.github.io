/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { CourseWaitlistButton } from "./course-waitlist-button";

describe("CourseWaitlistButton", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && !window.location.origin) {
      // @ts-ignore
      delete window.location;
      // @ts-ignore
      window.location = new URL("http://localhost:3000");
    }
  });

  it("renderiza o botão de aviso de disponibilidade corretamente", () => {
    render(
      <SessionProvider session={null}>
        <CourseWaitlistButton courseId={1} />
      </SessionProvider>
    );
    expect(screen.getByRole("button", { name: /avise-me quando disponível/i })).toBeDefined();
  });
});
