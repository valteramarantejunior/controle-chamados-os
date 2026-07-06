import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { criarUsuario, alternarAtivoUsuario } from "@/lib/actions/usuarios";
import { input, label, btnPrimary, btnSecondary, card, badge } from "@/lib/ui";
import { PAPEL_LABEL } from "@/lib/labels";

export default async function UsuariosPage() {
  await requireRole("ADMIN");

  const usuarios = await prisma.user.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Usuários</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form action={criarUsuario} className={`${card} p-6 space-y-4 h-fit`}>
          <h2 className="font-medium text-slate-900">Novo usuário</h2>
          <div>
            <label htmlFor="nome" className={label}>
              Nome *
            </label>
            <input id="nome" name="nome" required className={input} />
          </div>
          <div>
            <label htmlFor="email" className={label}>
              E-mail *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={input}
            />
          </div>
          <div>
            <label htmlFor="senha" className={label}>
              Senha *
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              minLength={6}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="papel" className={label}>
              Papel
            </label>
            <select
              id="papel"
              name="papel"
              defaultValue="ATENDENTE"
              className={input}
            >
              {Object.entries(PAPEL_LABEL).map(([value, l]) => (
                <option key={value} value={value}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={btnPrimary}>
            Criar usuário
          </button>
        </form>

        <div className={`${card} lg:col-span-2 h-fit`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {PAPEL_LABEL[u.papel]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`${badge} ${
                        u.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={alternarAtivoUsuario.bind(null, u.id, !u.ativo)}
                    >
                      <button
                        type="submit"
                        className="text-xs text-slate-600 hover:underline"
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
