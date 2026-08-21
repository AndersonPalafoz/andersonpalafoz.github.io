/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { CourseWaitlistButton } from "./course-waitlist-button";

describe("CourseWaitlistButton", () => {
  it("renderiza o botão de aviso de disponibilidade corretamente", () => {
    render(
      <SessionProvider session={null}>
        <CourseWaitlistButton courseId={1} />
      </SessionProvider>
    );
    expect(screen.getByRole("button", { name: /avise-me quando disponível/i })).toBeDefined();
  });
});
