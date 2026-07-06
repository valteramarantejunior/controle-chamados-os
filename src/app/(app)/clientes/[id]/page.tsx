import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { atualizarCliente } from "@/lib/actions/clientes";
import { input, label, btnPrimary, card, badge } from "@/lib/ui";
import {
  STATUS_CHAMADO_LABEL,
  STATUS_CHAMADO_COLOR,
  STATUS_OS_LABEL,
  STATUS_OS_COLOR,
  formatDate,
} from "@/lib/labels";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      chamados: { orderBy: { createdAt: "desc" } },
      ordensServico: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cliente) notFound();

  const atualizarComId = atualizarCliente.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        {cliente.nome}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          key={cliente.updatedAt.toISOString()}
          action={atualizarComId}
          className={`${card} p-6 space-y-4 lg:col-span-1 h-fit`}
        >
          <div>
            <label htmlFor="nome" className={label}>
              Nome *
            </label>
            <input
              id="nome"
              name="nome"
              required
              defaultValue={cliente.nome}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="telefone" className={label}>
              Telefone
            </label>
            <input
              id="telefone"
              name="telefone"
              defaultValue={cliente.telefone ?? ""}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="email" className={label}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={cliente.email ?? ""}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="endereco" className={label}>
              Endereço
            </label>
            <input
              id="endereco"
              name="endereco"
              defaultValue={cliente.endereco ?? ""}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="observacoes" className={label}>
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={3}
              defaultValue={cliente.observacoes ?? ""}
              className={input}
            />
          </div>
          <button type="submit" className={btnPrimary}>
            Salvar alterações
          </button>
        </form>

        <div className="lg:col-span-2 space-y-6">
          <div className={card}>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-medium text-slate-900">Chamados</h2>
              <Link
                href={`/chamados/novo?clienteId=${cliente.id}`}
                className="text-sm text-slate-600 hover:underline"
              >
                Abrir chamado
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {cliente.chamados.map((chamado) => (
                <li key={chamado.id} className="px-4 py-3">
                  <Link
                    href={`/chamados/${chamado.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        #{chamado.numero} — {chamado.titulo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(chamado.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`${badge} ${STATUS_CHAMADO_COLOR[chamado.status]}`}
                    >
                      {STATUS_CHAMADO_LABEL[chamado.status]}
                    </span>
                  </Link>
                </li>
              ))}
              {cliente.chamados.length === 0 && (
                <li className="px-4 py-6 text-center text-slate-400 text-sm">
                  Nenhum chamado registrado.
                </li>
              )}
            </ul>
          </div>

          <div className={card}>
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="font-medium text-slate-900">Ordens de Serviço</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {cliente.ordensServico.map((os) => (
                <li key={os.id} className="px-4 py-3">
                  <Link
                    href={`/ordens-servico/${os.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        OS #{os.numero} — {os.descricao}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(os.createdAt)}
                      </p>
                    </div>
                    <span className={`${badge} ${STATUS_OS_COLOR[os.status]}`}>
                      {STATUS_OS_LABEL[os.status]}
                    </span>
                  </Link>
                </li>
              ))}
              {cliente.ordensServico.length === 0 && (
                <li className="px-4 py-6 text-center text-slate-400 text-sm">
                  Nenhuma ordem de serviço registrada.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
