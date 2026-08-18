import { ReactNode, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  Library, 
  Calendar, 
  Award, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert,
  GraduationCap,
  Camera,
  Loader2
} from "lucide-react";
import { useAuth } from "@/app/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const navItems = [
    { href: "/dashboard", label: "Visão Geral", icon: Home },
    { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
    { href: "/dashboard/meus-cursos", label: "Cursos Externos & Notas", icon: GraduationCap },
    { href: "/dashboard/atividades", label: "Atividades & Speaking", icon: CheckSquare },
    { href: "/dashboard/materiais", label: "Biblioteca de Materiais", icon: Library },
    { href: "/dashboard/calendario", label: "Calendário & Deadlines", icon: Calendar },
    { href: "/dashboard/certificados", label: "Certificados", icon: Award },
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: UserIcon },
  ];

  if (user?.role === "admin" || user?.email === "palafozanderson@gmail.com") {
    navItems.push(
      { href: "/admin", label: "Painel Admin", icon: ShieldAlert },
      { href: "/professor", label: "Painel Professor", icon: GraduationCap }
    );
  }

  const avatarUrl = customAvatar || user?.image;
  const userName = user?.name || user?.email || "Usuário";
  const userInitials = userName.slice(0, 2).toUpperCase();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar imagem.");

      const newUrl = data.url || URL.createObjectURL(file);
      setCustomAvatar(newUrl);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (err) {
      // Fallback local caso o endpoint falhe
      const localUrl = URL.createObjectURL(file);
      setCustomAvatar(localUrl);
      toast.success("Foto de perfil atualizada localmente!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            AP
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">Anderson Palafoz</h2>
            <p className="text-xs text-red-600 font-medium">Plataforma Acadêmica</p>
          </div>
        </div>

        {/* Perfil do Usuário na Sidebar com Upload Direto */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 shadow-sm relative group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div 
            onClick={handleAvatarClick}
            className="relative cursor-pointer shrink-0 group"
            title="Clique para alterar a foto de perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-11 h-11 rounded-full object-cover border-2 border-red-600 shadow group-hover:opacity-90 transition" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center border-2 border-red-600 shadow group-hover:opacity-90 transition">
                {userInitials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </div>
          </div>
          <div className="overflow-hidden cursor-pointer" onClick={handleAvatarClick} title="Clique para alterar foto">
            <p className="font-bold text-sm truncate text-gray-900 flex items-center gap-1">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || "aluno@andersonpalafoz.com"}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
              {user?.role || "Aluno"} (Alterar foto)
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => logout()}
            className="w-full justify-start gap-2 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
          >
            <LogOut size={16} /> Encerrar Sessão
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
              AP
            </div>
            <span className="font-bold">Anderson Palafoz</span>
          </div>
          <div className="flex items-center gap-2">
            <div onClick={handleAvatarClick} className="cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover border border-red-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center border border-red-600">
                  {userInitials}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
