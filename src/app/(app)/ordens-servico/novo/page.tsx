import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { criarOrdemServico } from "@/lib/actions/ordens-servico";
import { input, label, btnPrimary, btnSecondary, card } from "@/lib/ui";

export default async function NovaOrdemServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; chamadoId?: string }>;
}) {
  await requireRole("ADMIN", "ATENDENTE");
  const { clienteId, chamadoId } = await searchParams;

  const [clientes, tecnicos] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.user.findMany({
      where: { papel: "TECNICO", ativo: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Nova Ordem de Serviço
      </h1>
      <form action={criarOrdemServico} className={`${card} p-6 space-y-4`}>
        {chamadoId && (
          <input type="hidden" name="chamadoId" value={chamadoId} />
        )}
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
          <label htmlFor="descricao" className={label}>
            Descrição do serviço *
          </label>
          <textarea
            id="descricao"
            name="descricao"
            required
            rows={4}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="tecnicoId" className={label}>
            Técnico responsável
          </label>
          <select id="tecnicoId" name="tecnicoId" className={input}>
            <option value="">Sem técnico definido</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dataAgendada" className={label}>
              Data agendada
            </label>
            <input
              id="dataAgendada"
              name="dataAgendada"
              type="datetime-local"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="valor" className={label}>
              Valor (R$)
            </label>
            <input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              className={input}
            />
          </div>
        </div>
        <div>
          <label htmlFor="observacoes" className={label}>
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            className={input}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Criar ordem de serviço
          </button>
          <Link href="/ordens-servico" className={btnSecondary}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
