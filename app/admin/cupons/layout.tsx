import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/admin-auth";

export default async function CouponsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();
  if (!session) redirect("/admin?notice=restricted");
  return children;
}
