// Middleware de proteção de rotas (admin e dashboard) usando NextAuth JWT
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Proteger rotas /admin - apenas admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Verificar se user eh admin
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Proteger rotas /dashboard - qualquer usuario autenticado
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
