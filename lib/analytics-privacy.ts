const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/dashboard",
  "/professor",
  "/aluno",
  "/login",
  "/cadastro",
  "/primeiro-acesso",
  "/redefinir-senha",
];

export function isPrivateAnalyticsPath(pathname: string) {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
