
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  loginMethod: string | null;
  createdAt: string;
  lastSignedIn: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Falha ao carregar usuários");
      }

      const data = await response.json();
      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, email: string | null) => {
    if (email === "palafozanderson@gmail.com") {
      alert("Não é possível deletar o usuário admin");
      return;
    }

    if (!confirm("Tem certeza que deseja deletar este usuário?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar usuário");
      }

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar usuário");
    }
  };

  const handleChangeRole = async (userId: number, newRole: "user" | "admin") => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar role");
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar role");
    }
  };

  const filteredUsers =
    roleFilter === "all"
      ? users
      : users.filter((u) => u.role === roleFilter);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie professores, alunos e administradores da plataforma
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={roleFilter === "all" ? "default" : "outline"}
            onClick={() => setRoleFilter("all")}
            className={roleFilter === "all" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Todos ({users.length})
          </Button>
          <Button
            variant={roleFilter === "user" ? "default" : "outline"}
            onClick={() => setRoleFilter("user")}
            className={roleFilter === "user" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Alunos ({users.filter((u) => u.role === "user").length})
          </Button>
          <Button
            variant={roleFilter === "admin" ? "default" : "outline"}
            onClick={() => setRoleFilter("admin")}
            className={roleFilter === "admin" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Admin ({users.filter((u) => u.role === "admin").length})
          </Button>
        </div>

        {/* Tabela de Usuários */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Carregando usuários...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Erro: {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.name || "Sem nome"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleChangeRole(
                              user.id,
                              e.target.value as "user" | "admin"
                            )
                          }
                          disabled={user.email === "palafozanderson@gmail.com"}
                          className="px-3 py-1 rounded border border-gray-300 text-sm font-medium"
                        >
                          <option value="user">Aluno</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteUser(user.id, user.email)
                            }
                            disabled={
                              user.email === "palafozanderson@gmail.com"
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Link para voltar */}
        <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline">Voltar para Admin</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
