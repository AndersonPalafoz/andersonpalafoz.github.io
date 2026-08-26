"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProtectedPanel = Boolean(pathname?.startsWith("/dashboard") || pathname?.startsWith("/professor") || pathname?.startsWith("/admin"));

  if (isProtectedPanel) {
    return <main className="min-h-[100dvh]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[4.5rem]">{children}</main>
      <Footer />
    </>
  );
}
