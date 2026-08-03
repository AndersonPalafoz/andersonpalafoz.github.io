"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const PRIVATE_SHELL_ROUTES = ["/admin"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const usesPrivateShell = PRIVATE_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (usesPrivateShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
