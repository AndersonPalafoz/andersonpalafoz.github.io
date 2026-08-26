"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { canAccessAdminPortal, canAccessProfessorPortal, getEffectiveRole, isSuperadmin } from "@/lib/role-capabilities";

export function useAuth(requireAuth = false) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const capabilities = useMemo(() => {
    const input = { email: session?.user?.email, role: session?.user?.role };
    return {
      effectiveRole: getEffectiveRole(input),
      canAccessAdmin: canAccessAdminPortal(input),
      canAccessProfessor: canAccessProfessorPortal(input),
      isSuperadmin: isSuperadmin(input),
    };
  }, [session?.user?.email, session?.user?.role]);

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, requireAuth, router]);

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    ...capabilities,
  };
}
