import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook para proteger rotas que requerem autenticação
 * Redireciona para login se o usuário não estiver autenticado
 */
export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redireciona para home se não autenticado
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  return { isAuthenticated, loading };
}

/**
 * Hook para proteger rotas que requerem role admin
 */
export function useAdminRoute() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      // Redireciona para home se não for admin
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  return { isAdmin: user?.role === "admin", loading };
}
