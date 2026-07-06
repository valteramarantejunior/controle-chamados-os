import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { card } from "@/lib/ui";
import { STATUS_CHAMADO_LABEL, STATUS_OS_LABEL } from "@/lib/labels";
import StatusBarChart from "@/components/StatusBarChart";

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    chamadosPorStatus,
    ordensPorStatus,
    chamadosAbertos,
    osEmAndamento,
    chamadosFechados,
  ] = await Promise.all([
    prisma.chamado.groupBy({ by: ["status"], _count: true }),
    prisma.ordemServico.groupBy({ by: ["status"], _count: true }),
    prisma.chamado.count({ where: { status: { in: ["ABERTO", "EM_ANDAMENTO", "AGUARDANDO_CLIENTE"] } } }),
    prisma.ordemServico.count({ where: { status: { in: ["ABERTA", "EM_EXECUCAO"] } } }),
    prisma.chamado.findMany({
      where: { fechadoEm: { not: null } },
      select: { createdAt: true, fechadoEm: true },
    }),
  ]);

  const tempoMedioMs =
    chamadosFechados.length > 0
      ? chamadosFechados.reduce(
          (soma, c) => soma + (c.fechadoEm!.getTime() - c.createdAt.getTime()),
          0
        ) / chamadosFechados.length
      : null;

  const tempoMedioHoras = tempoMedioMs
    ? Math.round(tempoMedioMs / (1000 * 60 * 60))
    : null;

  const chamadosChartData = Object.entries(STATUS_CHAMADO_LABEL).map(
    ([status, label]) => ({
      label,
      valor:
        chamadosPorStatus.find((c) => c.status === status)?._count ?? 0,
    })
  );

  const osChartData = Object.entries(STATUS_OS_LABEL).map(([status, label]) => ({
    label,
    valor: ordensPorStatus.find((o) => o.status === status)?._count ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="text-slate-500 mt-1 mb-6">Bem-vindo, {user.name}.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={`${card} p-5`}>
          <p className="text-sm text-slate-500">Chamados em aberto</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {chamadosAbertos}
          </p>
        </div>
        <div className={`${card} p-5`}>
          <p className="text-sm text-slate-500">Ordens de serviço ativas</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {osEmAndamento}
          </p>
        </div>
        <div className={`${card} p-5`}>
          <p className="text-sm text-slate-500">Tempo médio de resolução</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {tempoMedioHoras !== null ? `${tempoMedioHoras}h` : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} p-5`}>
          <h2 className="font-medium text-slate-900 mb-4">
            Chamados por status
          </h2>
          <StatusBarChart data={chamadosChartData} color="#0f172a" />
        </div>
        <div className={`${card} p-5`}>
          <h2 className="font-medium text-slate-900 mb-4">
            Ordens de serviço por status
          </h2>
          <StatusBarChart data={osChartData} color="#0ea5e9" />
        </div>
      </div>
    </div>
  );
}
