import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function DashboardProfile() {
  const { loading } = useProtectedRoute();

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </StudentDashboardLayout>
    );
  }
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "João Silva",
    email: "joao@example.com",
    joinDate: "2024-01-15",
    level: "A2",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Informações Pessoais</CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{profileData.name}</p>
                <p className="text-sm text-muted-foreground">
                  Membro desde {new Date(profileData.joinDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="level">Nível Atual</Label>
                <Input
                  id="level"
                  name="level"
                  value={profileData.level}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            </div>

            {isEditing && (
              <Button
                onClick={handleSave}
                className="w-full bg-primary hover:bg-primary-hover text-white"
              >
                Salvar Alterações
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Learning Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Aprendizagem</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: "Cursos Inscritos", value: "2" },
                { label: "Horas Aprendidas", value: "24h 30m" },
                { label: "Certificados", value: "2" },
                { label: "Atividades Completas", value: "18" },
                { label: "Pontuação Total", value: "850" },
                { label: "Streak Atual", value: "12 dias" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  Notificações por Email
                </p>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações sobre seus cursos
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Newsletter</p>
                <p className="text-sm text-muted-foreground">
                  Dicas e conteúdo exclusivo
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
