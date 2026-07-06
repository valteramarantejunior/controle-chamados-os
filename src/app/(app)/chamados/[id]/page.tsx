import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { atualizarChamado, adicionarInteracao } from "@/lib/actions/chamados";
import { input, label, btnPrimary, btnSecondary, card, badge } from "@/lib/ui";
import {
  STATUS_CHAMADO_LABEL,
  STATUS_CHAMADO_COLOR,
  PRIORIDADE_LABEL,
  STATUS_OS_LABEL,
  STATUS_OS_COLOR,
  formatDate,
} from "@/lib/labels";

export default async function ChamadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    include: {
      cliente: true,
      atendente: true,
      ordensServico: true,
      interacoes: { orderBy: { createdAt: "asc" }, include: { autor: true } },
    },
  });

  if (!chamado) notFound();

  const podeEditar =
    user.role === "ADMIN" || user.role === "ATENDENTE" || user.role === "TECNICO";
  const atendentes = podeEditar
    ? await prisma.user.findMany({
        where: { papel: { in: ["ADMIN", "ATENDENTE"] }, ativo: true },
        orderBy: { nome: "asc" },
      })
    : [];

  const atualizarComId = atualizarChamado.bind(null, id);
  const adicionarComId = adicionarInteracao.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">
            Chamado #{chamado.numero} · {chamado.cliente.nome}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {chamado.titulo}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`${badge} ${STATUS_CHAMADO_COLOR[chamado.status]}`}>
            {STATUS_CHAMADO_LABEL[chamado.status]}
          </span>
          {podeEditar && (
            <Link
              href={`/ordens-servico/novo?chamadoId=${chamado.id}&clienteId=${chamado.clienteId}`}
              className={btnPrimary}
            >
              Gerar OS
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {podeEditar ? (
            <form
              key={chamado.updatedAt.toISOString()}
              action={atualizarComId}
              className={`${card} p-6 space-y-4`}
            >
              <div>
                <label htmlFor="titulo" className={label}>
                  Título
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  defaultValue={chamado.titulo}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="descricao" className={label}>
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  rows={4}
                  defaultValue={chamado.descricao}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="categoria" className={label}>
                  Categoria
                </label>
                <input
                  id="categoria"
                  name="categoria"
                  defaultValue={chamado.categoria ?? ""}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="prioridade" className={label}>
                  Prioridade
                </label>
                <select
                  id="prioridade"
                  name="prioridade"
                  defaultValue={chamado.prioridade}
                  className={input}
                >
                  {Object.entries(PRIORIDADE_LABEL).map(([value, l]) => (
                    <option key={value} value={value}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className={label}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={chamado.status}
                  className={input}
                >
                  {Object.entries(STATUS_CHAMADO_LABEL).map(([value, l]) => (
                    <option key={value} value={value}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="atendenteId" className={label}>
                  Atendente responsável
                </label>
                <select
                  id="atendenteId"
                  name="atendenteId"
                  defaultValue={chamado.atendenteId ?? ""}
                  className={input}
                >
                  <option value="">Sem atendente</option>
                  {atendentes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={btnPrimary}>
                Salvar alterações
              </button>
            </form>
          ) : (
            <div className={`${card} p-6 space-y-3 text-sm`}>
              <p className="text-slate-700">{chamado.descricao}</p>
              <p className="text-slate-500">
                Categoria: {chamado.categoria ?? "—"}
              </p>
              <p className="text-slate-500">
                Prioridade: {PRIORIDADE_LABEL[chamado.prioridade]}
              </p>
              <p className="text-slate-500">
                Atendente: {chamado.atendente?.nome ?? "—"}
              </p>
            </div>
          )}

          {chamado.ordensServico.length > 0 && (
            <div className={card}>
              <div className="px-4 py-3 border-b border-slate-200">
                <h2 className="font-medium text-slate-900">
                  Ordens de Serviço
                </h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {chamado.ordensServico.map((os) => (
                  <li key={os.id} className="px-4 py-3">
                    <Link
                      href={`/ordens-servico/${os.id}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        OS #{os.numero}
                      </span>
                      <span
                        className={`${badge} ${STATUS_OS_COLOR[os.status]}`}
                      >
                        {STATUS_OS_LABEL[os.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className={card}>
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="font-medium text-slate-900">
                Histórico de interações
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {chamado.interacoes.map((interacao) => (
                <li key={interacao.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">
                      {interacao.autor.nome}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(interacao.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                    {interacao.mensagem}
                  </p>
                </li>
              ))}
              {chamado.interacoes.length === 0 && (
                <li className="px-4 py-6 text-center text-slate-400 text-sm">
                  Nenhuma interação registrada.
                </li>
              )}
            </ul>
            <form
              action={adicionarComId}
              className="px-4 py-4 border-t border-slate-200 flex gap-3"
            >
              <textarea
                name="mensagem"
                required
                rows={2}
                placeholder="Adicionar uma atualização..."
                className={`${input} flex-1`}
              />
              <button type="submit" className={btnSecondary}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
