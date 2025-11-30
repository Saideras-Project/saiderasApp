"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ShieldAlert, Shield, User as UserIcon } from "lucide-react";
import { User, UserRole } from "../../../types/users";
import { Button } from "../../../components/ui/Button";
import { UserModal } from "../../../components/users/UserModal";
import { jwtDecode } from "jwt-decode";

const roleNames: Record<UserRole, string> = {
  MANAGER: "Gerente",
  CAIXA: "Caixa",
  GARCOM: "Garçom",
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Não autorizado. Faça login novamente.");
      return null;
    }
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ id: string }>(token);
        setCurrentUserId(decoded.id);
      } catch (e) { console.error(e); }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/users', { headers });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Falha ao carregar usuários.");
      }
      const data: User[] = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error("Falha ao excluir usuário");
      
      await fetchUsers();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Ocorreu um erro desconhecido.");
      }
    }
  };

  const handleSave = async (userData: Partial<User>) => {
    setIsSaving(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const method = editingUser ? 'PUT' : 'POST';
      // Nota: A rota de API de usuários para POST é /api/auth/register ou /api/users
      // Assumindo que /api/users aceita POST para criar usuários (se não, deve-se usar /api/auth/register)
      // Mas como o usuário atual é ADMIN e está criando outro usuário, /api/users é o ideal se implementado.
      // Vou usar /api/auth/register para criação como fallback se /api/users não suportar.
      // Mas vou tentar /api/users para criação e edição para manter consistência se a API suportar.
      // Se a API original só tiver /api/auth/register para criação, uso ela.
      // No passo de leitura anterior, vi `src/app/api/auth/register/route.ts`. 
      // Vou usar `api/users` para PUT e `api/auth/register` para POST (criação).
      
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/auth/register';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Falha ao salvar usuário");
      }

      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar dados: {error}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestão de Usuários</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Controle de acesso e permissões do sistema</p>
        </div>
        <Button onClick={handleOpenNew} icon={<Plus size={18} />}>
          Novo Usuário
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors duration-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm font-medium uppercase border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Login</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <UserIcon size={16} />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-200">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-sm">
                  {user.username}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase
                    ${user.role === 'MANAGER' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 
                      user.role === 'CAIXA' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                      'bg-blue-500/10 text-blue-600 dark:text-blue-400'}
                  `}>
                    {user.role === 'MANAGER' && <ShieldAlert size={12} />}
                    {user.role === 'CAIXA' && <Shield size={12} />}
                    {roleNames[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors"
                      title="Editar Usuário"
                    >
                      <Pencil size={16} />
                    </button>
                    {user.id !== currentUserId ? (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic px-2">Atual</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        user={editingUser}
        isLoading={isSaving}
      />
    </div>
  );
}