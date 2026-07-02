
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar e Info Principal */}
        <div className="md:col-span-1">
          <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <User className="text-primary" size={48} />
            </div>
            <div className="text-center">
              <h2 className="font-bold text-foreground text-lg">Seu Nome</h2>
              <p className="text-sm text-muted-foreground">Aluno</p>
            </div>
            <Button className="w-full" variant="outline">
              Alterar Foto
            </Button>
          </div>
        </div>

        {/* Formulário de Edição */}
        <div className="md:col-span-2">
          <div className="p-6 rounded-lg border border-border bg-card space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Nome Completo
              </label>
              <Input
                type="text"
                placeholder="Seu nome"
                defaultValue="Seu Nome"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                defaultValue="seu@email.com"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Telefone
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  defaultValue="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Localização
                </label>
                <Input
                  type="text"
                  placeholder="Cidade, Estado"
                  defaultValue="Salvador, BA"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Bio
              </label>
              <textarea
                className="w-full p-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Conte um pouco sobre você"
                defaultValue="Estou aprendendo inglês para melhorar minha carreira"
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">Salvar Alterações</Button>
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Segurança */}
      <div className="p-6 rounded-lg border border-border bg-card space-y-4">
        <h3 className="font-bold text-foreground text-lg">Segurança</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Senha</p>
              <p className="text-sm text-muted-foreground">
                Altere sua senha regularmente
              </p>
            </div>
            <Button variant="outline" size="sm">
              Alterar
            </Button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="font-medium text-foreground">Autenticação</p>
              <p className="text-sm text-muted-foreground">
                Conectado via Google
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Conectado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
