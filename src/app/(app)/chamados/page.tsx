import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { card, btnPrimary, input, badge } from "@/lib/ui";
import {
  STATUS_CHAMADO_LABEL,
  STATUS_CHAMADO_COLOR,
  PRIORIDADE_LABEL,
  PRIORIDADE_COLOR,
  formatDate,
} from "@/lib/labels";
import type { Prioridade, StatusChamado } from "@/generated/prisma/client";

export default async function ChamadosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; prioridade?: string }>;
}) {
  await requireUser();
  const { status, prioridade } = await searchParams;

  const chamados = await prisma.chamado.findMany({
    where: {
      status: (status as StatusChamado) || undefined,
      prioridade: (prioridade as Prioridade) || undefined,
    },
    orderBy: { createdAt: "desc" },
    include: { cliente: true, atendente: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Chamados</h1>
        <Link href="/chamados/novo" className={btnPrimary}>
          Novo Chamado
        </Link>
      </div>

      <form className="flex gap-3 mb-4">
        <select name="status" defaultValue={status ?? ""} className={`${input} max-w-xs`}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CHAMADO_LABEL).map(([value, l]) => (
            <option key={value} value={value}>
              {l}
            </option>
          ))}
        </select>
        <select
          name="prioridade"
          defaultValue={prioridade ?? ""}
          className={`${input} max-w-xs`}
        >
          <option value="">Todas as prioridades</option>
          {Object.entries(PRIORIDADE_LABEL).map(([value, l]) => (
            <option key={value} value={value}>
              {l}
            </option>
          ))}
        </select>
        <button type="submit" className="text-sm text-slate-600 hover:underline">
          Filtrar
        </button>
      </form>

      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Atendente</th>
              <th className="px-4 py-3 font-medium">Prioridade</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aberto em</th>
            </tr>
          </thead>
          <tbody>
            {chamados.map((chamado) => (
              <tr
                key={chamado.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-slate-500">{chamado.numero}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/chamados/${chamado.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {chamado.titulo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {chamado.cliente.nome}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {chamado.atendente?.nome ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`${badge} ${PRIORIDADE_COLOR[chamado.prioridade]}`}
                  >
                    {PRIORIDADE_LABEL[chamado.prioridade]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`${badge} ${STATUS_CHAMADO_COLOR[chamado.status]}`}
                  >
                    {STATUS_CHAMADO_LABEL[chamado.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(chamado.createdAt)}
                </td>
              </tr>
            ))}
            {chamados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhum chamado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
