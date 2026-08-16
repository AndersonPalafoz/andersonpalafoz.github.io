"use client";

import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user ? {
      id: (session.user as any).id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user as any).role || "user",
    } : null,
    isLoading: status === "loading",
    logout: () => signOut({ callbackUrl: "/login" }),
  };
}
