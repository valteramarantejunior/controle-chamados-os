import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/session";
import { signOut } from "@/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", roles: ["ADMIN", "ATENDENTE", "TECNICO"] },
  { href: "/clientes", label: "Clientes", roles: ["ADMIN", "ATENDENTE"] },
  {
    href: "/chamados",
    label: "Chamados",
    roles: ["ADMIN", "ATENDENTE", "TECNICO"],
  },
  {
    href: "/ordens-servico",
    label: "Ordens de Serviço",
    roles: ["ADMIN", "ATENDENTE", "TECNICO"],
  },
  { href: "/relatorios", label: "Relatórios", roles: ["ADMIN", "ATENDENTE"] },
  { href: "/usuarios", label: "Usuários", roles: ["ADMIN"] },
];

const PAPEL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  ATENDENTE: "Atendente",
  TECNICO: "Técnico",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="bg-white rounded-md px-3 py-2">
            <Image
              src="/logo.png"
              alt="JD Segurança e Tecnologia"
              width={160}
              height={40}
              className="w-full h-auto"
              priority
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Controle de Chamados e OS
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <p className="px-3 text-sm font-medium truncate">{user.name}</p>
          <p className="px-3 text-xs text-slate-400 mb-2">
            {PAPEL_LABEL[user.role] ?? user.role}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
