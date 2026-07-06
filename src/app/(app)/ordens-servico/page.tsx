import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { card, btnPrimary, input, badge } from "@/lib/ui";
import {
  STATUS_OS_LABEL,
  STATUS_OS_COLOR,
  formatDate,
  formatCurrency,
} from "@/lib/labels";
import type { StatusOS } from "@/generated/prisma/client";

export default async function OrdensServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const { status } = await searchParams;

  const ordens = await prisma.ordemServico.findMany({
    where: {
      status: (status as StatusOS) || undefined,
    },
    orderBy: { createdAt: "desc" },
    include: { cliente: true, tecnico: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Ordens de Serviço
        </h1>
        <Link href="/ordens-servico/novo" className={btnPrimary}>
          Nova Ordem de Serviço
        </Link>
      </div>

      <form className="flex gap-3 mb-4">
        <select
          name="status"
          defaultValue={status ?? ""}
          className={`${input} max-w-xs`}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_OS_LABEL).map(([value, l]) => (
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
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Técnico</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Agendada</th>
            </tr>
          </thead>
          <tbody>
            {ordens.map((os) => (
              <tr
                key={os.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-slate-500">{os.numero}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/ordens-servico/${os.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {os.descricao}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{os.cliente.nome}</td>
                <td className="px-4 py-3 text-slate-600">
                  {os.tecnico?.nome ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCurrency(os.valor as unknown as string)}
                </td>
                <td className="px-4 py-3">
                  <span className={`${badge} ${STATUS_OS_COLOR[os.status]}`}>
                    {STATUS_OS_LABEL[os.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(os.dataAgendada)}
                </td>
              </tr>
            ))}
            {ordens.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
