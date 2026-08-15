// Middleware de proteção de rotas (admin e dashboard) usando NextAuth JWT
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isAdminRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isApproved = token.approvalStatus === "approved";
  const isActive = !token.deletedAt;

  // O painel é reservado ao papel admin e ao acesso aprovado.
  if (isAdminRoute) {
    if (token.role !== "admin" || !isApproved || !isActive) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Cursos, progresso e perfil só ficam disponíveis para contas aprovadas.
  if (isDashboardRoute) {
    if (!isActive || token.approvalStatus !== "approved") {
      const destination = token.approvalStatus === "rejected" || !isActive
        ? "/acesso-negado?reason=blocked"
        : "/acesso-pendente";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
