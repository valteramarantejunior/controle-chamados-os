import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { criarChamado } from "@/lib/actions/chamados";
import { input, label, btnPrimary, btnSecondary, card } from "@/lib/ui";
import { PRIORIDADE_LABEL } from "@/lib/labels";

export default async function NovoChamadoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  await requireRole("ADMIN", "ATENDENTE");
  const { clienteId } = await searchParams;

  const [clientes, atendentes] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.user.findMany({
      where: { papel: { in: ["ADMIN", "ATENDENTE"] }, ativo: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Novo Chamado
      </h1>
      <form action={criarChamado} className={`${card} p-6 space-y-4`}>
        <div>
          <label htmlFor="clienteId" className={label}>
            Cliente *
          </label>
          <select
            id="clienteId"
            name="clienteId"
            required
            defaultValue={clienteId ?? ""}
            className={input}
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="titulo" className={label}>
            Título *
          </label>
          <input id="titulo" name="titulo" required className={input} />
        </div>
        <div>
          <label htmlFor="descricao" className={label}>
            Descrição *
          </label>
          <textarea
            id="descricao"
            name="descricao"
            required
            rows={4}
            className={input}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoria" className={label}>
              Categoria
            </label>
            <input id="categoria" name="categoria" className={input} />
          </div>
          <div>
            <label htmlFor="prioridade" className={label}>
              Prioridade
            </label>
            <select
              id="prioridade"
              name="prioridade"
              defaultValue="MEDIA"
              className={input}
            >
              {Object.entries(PRIORIDADE_LABEL).map(([value, l]) => (
                <option key={value} value={value}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="atendenteId" className={label}>
            Atendente responsável
          </label>
          <select id="atendenteId" name="atendenteId" className={input}>
            {atendentes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Abrir chamado
          </button>
          <Link href="/chamados" className={btnSecondary}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
