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

  it("persists the database role and user id in the JWT", async () => {
    mocks.findFirst.mockResolvedValue({ id: 42, role: "admin" });

    const token = await jwtCallback?.({
      token: { email: "palafozanderson@gmail.com" },
      user: undefined,
      account: undefined,
    } as any);

    expect(token).toMatchObject({
      email: "palafozanderson@gmail.com",
      id: "42",
      role: "admin",
    });
    expect(mocks.findFirst).toHaveBeenCalledTimes(1);
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
      token: { id: "42", role: "admin" },
    } as any);

    expect(session?.user).toMatchObject({
      id: "42",
      role: "admin",
    });
  });
});
