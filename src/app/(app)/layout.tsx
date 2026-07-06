import { requireUser } from "@/lib/session";
import { signOut } from "@/auth";
import { AppSidebar } from "@/components/AppSidebar";

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

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar
        userName={user.name ?? ""}
        userRole={user.role}
        navItems={navItems}
        logoutAction={logout}
      />
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
