import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { card, input } from "@/lib/ui";
import { formatCurrency } from "@/lib/labels";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  await requireRole("ADMIN", "ATENDENTE");
  const { clienteId } = await searchParams;

  const [clientes, chamadosPorAtendente, osPorTecnico, valorTotalOS] =
    await Promise.all([
      prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
      prisma.user.findMany({
        where: { papel: { in: ["ADMIN", "ATENDENTE"] } },
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              chamadosAtendidos: clienteId ? { where: { clienteId } } : true,
            },
          },
        },
        orderBy: { nome: "asc" },
      }),
      prisma.user.findMany({
        where: { papel: "TECNICO" },
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              ordensServico: clienteId ? { where: { clienteId } } : true,
            },
          },
        },
        orderBy: { nome: "asc" },
      }),
      prisma.ordemServico.aggregate({
        _sum: { valor: true },
        where: { status: "CONCLUIDA", clienteId },
      }),
    ]);

  const pdfHref = clienteId
    ? `/api/relatorios/chamados.pdf?clienteId=${clienteId}`
    : "/api/relatorios/chamados.pdf";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
        <a
          href={pdfHref}
          target="_blank"
          className="text-sm text-slate-600 hover:underline"
        >
          Exportar chamados (PDF)
        </a>
      </div>

      <form className="flex gap-3 mb-6">
        <select
          name="clienteId"
          defaultValue={clienteId ?? ""}
          className={`${input} max-w-xs`}
        >
          <option value="">Todos os clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <button type="submit" className="text-sm text-slate-600 hover:underline">
          Filtrar
        </button>
        {clienteId && (
          <a
            href="/relatorios"
            className="text-sm text-slate-400 hover:underline"
          >
            Limpar filtro
          </a>
        )}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="font-medium text-slate-900">
              Chamados por atendente
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {chamadosPorAtendente.map((a) => (
              <li
                key={a.id}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <span className="text-slate-700">{a.nome}</span>
                <span className="font-medium text-slate-900">
                  {a._count.chamadosAtendidos}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={card}>
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="font-medium text-slate-900">
              Ordens de serviço por técnico
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {osPorTecnico.map((t) => (
              <li
                key={t.id}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <span className="text-slate-700">{t.nome}</span>
                <span className="font-medium text-slate-900">
                  {t._count.ordensServico}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${card} p-5`}>
          <p className="text-sm text-slate-500">
            Faturamento em OS concluídas
          </p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {formatCurrency(valorTotalOS._sum.valor as unknown as string)}
          </p>
        </div>
      </div>
    </div>
  );
}
