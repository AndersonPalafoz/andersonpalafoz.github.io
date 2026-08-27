import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("./db", () => ({
  db: {
    query: {
      users: {
        findFirst: mocks.findFirst,
      },
    },
  },
}));

import { authOptions } from "./auth";

describe("NextAuth role persistence", () => {
  const jwtCallback = authOptions.callbacks?.jwt;
  const sessionCallback = authOptions.callbacks?.session;

  beforeEach(() => {
    mocks.findFirst.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists the database role, approval status, deletion state and user id in the JWT", async () => {
    mocks.findFirst.mockResolvedValue({ id: 42, role: "admin", approvalStatus: "approved", deletedAt: null, avatarUrl: "https://cdn.example.com/avatar.webp" });

    const token = await jwtCallback?.({
      token: { email: "palafozanderson@gmail.com" },
      user: undefined,
      account: undefined,
    } as any);

    expect(token).toMatchObject({
      email: "palafozanderson@gmail.com",
      id: "42",
      role: "admin",
      approvalStatus: "approved",
      deletedAt: null,
      avatarUrl: "https://cdn.example.com/avatar.webp",
      picture: "https://cdn.example.com/avatar.webp",
    });
    expect(mocks.findFirst).toHaveBeenCalledTimes(1);
  });

  it("propagates a pending approval status for a regular account", async () => {
    mocks.findFirst.mockResolvedValue({ id: 77, role: "user", approvalStatus: "pending", deletedAt: null, avatarUrl: null });

    const token = await jwtCallback?.({
      token: { email: "student@example.com" },
      user: undefined,
      account: undefined,
    } as any);

    expect(token).toMatchObject({
      id: "77",
      role: "user",
      approvalStatus: "pending",
      deletedAt: null,
    });
  });

  it("keeps the main admin account authorized when the role lookup fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.findFirst.mockRejectedValue(new Error("database unavailable"));

    const token = await jwtCallback?.({
      token: { email: "palafozanderson@gmail.com" },
      user: undefined,
      account: undefined,
    } as any);

    expect(token).toMatchObject({
      email: "palafozanderson@gmail.com",
      role: "admin",
      approvalStatus: "approved",
    });
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("copies the JWT role and id into the NextAuth session", async () => {
    const session = await sessionCallback?.({
      session: {
        user: {
          name: "Anderson Palafoz",
          email: "palafozanderson@gmail.com",
        },
      },
      token: { id: "42", role: "admin", approvalStatus: "approved", deletedAt: null, avatarUrl: "https://cdn.example.com/avatar.webp" },
    } as any);

    expect(session?.user).toMatchObject({
      id: "42",
      role: "admin",
      approvalStatus: "approved",
      avatarUrl: "https://cdn.example.com/avatar.webp",
      image: "https://cdn.example.com/avatar.webp",
    });
  });
});

describe("Google OAuth scope separation", () => {
  it("does not request Calendar during the basic sign-in flow", () => {
    const googleProvider = authOptions.providers.find((provider: any) => provider.id === "google") as any;
    if (!googleProvider) {
      expect(process.env.GOOGLE_CLIENT_ID).toBeFalsy();
      return;
    }
    expect(JSON.stringify(googleProvider)).not.toContain("calendar.readonly");
  });
});
