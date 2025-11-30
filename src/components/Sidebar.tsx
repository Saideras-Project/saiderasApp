// components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Beer, LayoutDashboard, ShoppingCart, Truck, BarChart3, Users, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type TokenPayload = {
  id: string;
  role: 'MANAGER' | 'CAIXA' | 'GARCOM';
  iat: number;
  exp: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: Array<TokenPayload['role']>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, roles: ['MANAGER'] },
  { href: "/pdv", label: "PDV (Comandas)", icon: <Beer size={20} />, roles: ['GARCOM', 'CAIXA', 'MANAGER'] },
  { href: "/estoque", label: "Estoque", icon: <ShoppingCart size={20} />, roles: ['MANAGER'] },
  { href: "/compras", label: "Compras", icon: <Truck size={20} />, roles: ['MANAGER'] },
  { href: "/relatorios", label: "Relatórios", icon: <BarChart3 size={20} />, roles: ['MANAGER'] },
  { href: "/usuarios", label: "Usuários", icon: <Users size={20} />, roles: ['MANAGER'] },
];

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [userRole, setUserRole] = useState<TokenPayload['role'] | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        console.log(decoded);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Token inválido:", error);
        handleLogout();
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const sidebarClasses = `
    h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col box-border
    flex-shrink-0 whitespace-nowrap transition-all duration-300 ease-in-out
    ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
  `;

  if (!userRole) return null;

  return (
    <aside className={sidebarClasses}>
      <div className="p-6 flex items-center justify-center">
        <div className="relative h-16 w-40">
          <Image
            src="/saidera-logo.png"
            alt="Saidera Logo"
            fill
            className="object-contain dark:invert"
            priority
          />
        </div>
      </div>

      <div className="px-6 pb-6 mb-2 border-b border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
          Logado como
        </p>
        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
          {userName}
        </p>
        <span className="text-xs text-amber-500 font-medium capitalize">
          {userRole === "MANAGER"
            ? "Gerente"
            : userRole === "CAIXA"
            ? "Caixa"
            : "Garçom"}
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}