import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  atualizarOrdemServico,
  adicionarItemOS,
  removerItemOS,
  adicionarFotosOS,
  removerFotoOS,
  salvarAssinaturaTecnico,
  salvarAssinaturaCliente,
} from "@/lib/actions/ordens-servico";
import { input, label, btnPrimary, btnSecondary, card, badge } from "@/lib/ui";
import { STATUS_OS_LABEL, STATUS_OS_COLOR, formatDate, formatCurrency } from "@/lib/labels";
import { formatPhoneForWhatsApp, buildWhatsAppUrl } from "@/lib/whatsapp";
import { EnviarOsWhatsAppButton } from "@/components/EnviarOsWhatsAppButton";
import { SignaturePad } from "@/components/SignaturePad";

function toDatetimeLocal(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default async function OrdemServicoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: {
      cliente: true,
      tecnico: true,
      chamado: true,
      itens: { orderBy: { id: "asc" } },
      fotos: {
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
      },
    },
  });

  if (!os) notFound();

  const podeEditarTudo = user.role === "ADMIN" || user.role === "ATENDENTE";
  const podeEditar =
    podeEditarTudo || (user.role === "TECNICO" && os.tecnicoId === user.id);

  const tecnicos = podeEditarTudo
    ? await prisma.user.findMany({
        where: { papel: "TECNICO", ativo: true },
        orderBy: { nome: "asc" },
      })
    : [];

  const totalItens = os.itens.reduce(
    (soma, item) => soma + Number(item.valorUnitario) * item.quantidade,
    0
  );

  const atualizarComId = atualizarOrdemServico.bind(null, id);
  const adicionarItemComId = adicionarItemOS.bind(null, id);
  const adicionarFotosComId = adicionarFotosOS.bind(null, id);
  const salvarAssinaturaTecnicoComId = salvarAssinaturaTecnico.bind(null, id);
  const salvarAssinaturaClienteComId = salvarAssinaturaCliente.bind(null, id);

  const telefoneWhatsApp = formatPhoneForWhatsApp(os.cliente.telefone);
  const mensagemWhatsApp = [
    `Olá ${os.cliente.nome}! Segue a Ordem de Serviço #${os.numero}.`,
    "",
    `Serviço: ${os.descricao}`,
    `Status: ${STATUS_OS_LABEL[os.status]}`,
    `Técnico: ${os.tecnico?.nome ?? "A definir"}`,
    `Data agendada: ${formatDate(os.dataAgendada)}`,
    `Valor: ${formatCurrency(os.valor as unknown as string)}`,
    "",
    "O PDF completo da OS foi baixado agora nesta aba — é só anexar aqui e enviar.",
    "",
    "JD Segurança e Tecnologia",
  ].join("\n");
  const whatsappUrl = telefoneWhatsApp
    ? buildWhatsAppUrl(telefoneWhatsApp, mensagemWhatsApp)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">
            OS #{os.numero} · {os.cliente.nome}
            {os.chamado && (
              <>
                {" · "}
                <Link
                  href={`/chamados/${os.chamado.id}`}
                  className="hover:underline"
                >
                  Chamado #{os.chamado.numero}
                </Link>
              </>
            )}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {os.descricao}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`${badge} ${STATUS_OS_COLOR[os.status]}`}>
            {STATUS_OS_LABEL[os.status]}
          </span>
          <a
            href={`/api/ordens-servico/${os.id}/pdf`}
            target="_blank"
            className={btnSecondary}
          >
            Baixar PDF
          </a>
          {podeEditar && (
            <EnviarOsWhatsAppButton
              whatsappUrl={whatsappUrl}
              pdfUrl={`/api/ordens-servico/${os.id}/pdf`}
              pdfFileName={`OS-${os.numero}.pdf`}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {podeEditar ? (
            <form
              key={os.updatedAt.toISOString()}
              action={atualizarComId}
              className={`${card} p-6 space-y-4`}
            >
              {podeEditarTudo && (
                <div>
                  <label htmlFor="descricao" className={label}>
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={3}
                    defaultValue={os.descricao}
                    className={input}
                  />
                </div>
              )}
              {podeEditarTudo && (
                <div>
                  <label htmlFor="tecnicoId" className={label}>
                    Técnico responsável
                  </label>
                  <select
                    id="tecnicoId"
                    name="tecnicoId"
                    defaultValue={os.tecnicoId ?? ""}
                    className={input}
                  >
                    <option value="">Sem técnico definido</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="status" className={label}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={os.status}
                  className={input}
                >
                  {Object.entries(STATUS_OS_LABEL).map(([value, l]) => (
                    <option key={value} value={value}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              {podeEditarTudo && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dataAgendada" className={label}>
                      Data agendada
                    </label>
                    <input
                      id="dataAgendada"
                      name="dataAgendada"
                      type="datetime-local"
                      defaultValue={toDatetimeLocal(os.dataAgendada)}
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
                      defaultValue={os.valor ? String(os.valor) : ""}
                      className={input}
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="observacoes" className={label}>
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows={3}
                  defaultValue={os.observacoes ?? ""}
                  className={input}
                />
              </div>
              <button type="submit" className={btnPrimary}>
                Salvar alterações
              </button>
            </form>
          ) : (
            <div className={`${card} p-6 space-y-2 text-sm text-slate-600`}>
              <p>Data agendada: {formatDate(os.dataAgendada)}</p>
              <p>Valor: {formatCurrency(os.valor as unknown as string)}</p>
              <p>Observações: {os.observacoes ?? "—"}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className={card}>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-medium text-slate-900">
                Itens / Peças utilizadas
              </h2>
              <span className="text-sm text-slate-500">
                Total: {formatCurrency(totalItens)}
              </span>
            </div>
            <ul className="divide-y divide-slate-100">
              {os.itens.map((item) => (
                <li
                  key={item.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.descricao}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.quantidade} x{" "}
                      {formatCurrency(item.valorUnitario as unknown as string)}
                    </p>
                  </div>
                  {podeEditarTudo && (
                    <form
                      action={removerItemOS.bind(null, id, item.id)}
                    >
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </form>
                  )}
                </li>
              ))}
              {os.itens.length === 0 && (
                <li className="px-4 py-6 text-center text-slate-400 text-sm">
                  Nenhum item adicionado.
                </li>
              )}
            </ul>
            {podeEditarTudo && (
              <form
                action={adicionarItemComId}
                className="px-4 py-4 border-t border-slate-200 grid grid-cols-4 gap-3"
              >
                <input
                  name="descricao"
                  placeholder="Descrição"
                  required
                  className={`${input} col-span-2`}
                />
                <input
                  name="quantidade"
                  type="number"
                  min="1"
                  defaultValue={1}
                  className={input}
                />
                <input
                  name="valorUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor unit."
                  className={input}
                />
                <button
                  type="submit"
                  className={`${btnSecondary} col-span-4`}
                >
                  Adicionar item
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className={`${card} mt-6`}>
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-medium text-slate-900">Fotos do serviço</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {os.fotos.map((foto) => (
            <div key={foto.id} className="relative group">
              <a
                href={`/api/ordens-servico/${os.id}/fotos/${foto.id}`}
                target="_blank"
              >
                <img
                  src={`/api/ordens-servico/${os.id}/fotos/${foto.id}`}
                  alt="Foto da ordem de serviço"
                  className="w-full h-28 object-cover rounded-md border border-slate-200"
                />
              </a>
              {podeEditar && (
                <form
                  action={removerFotoOS.bind(null, id, foto.id)}
                  className="absolute top-1 right-1"
                >
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900/80 text-white text-xs px-2 py-0.5 hover:bg-red-600"
                  >
                    Remover
                  </button>
                </form>
              )}
            </div>
          ))}
          {os.fotos.length === 0 && (
            <p className="col-span-full text-center text-slate-400 text-sm py-4">
              Nenhuma foto adicionada.
            </p>
          )}
        </div>
        {podeEditar && (
          <form
            action={adicionarFotosComId}
            className="px-4 py-4 border-t border-slate-200 flex flex-wrap items-center gap-3"
          >
            <input
              type="file"
              name="fotos"
              accept="image/*"
              capture="environment"
              multiple
              required
              className="text-sm"
            />
            <button type="submit" className={btnSecondary}>
              Adicionar fotos
            </button>
          </form>
        )}
      </div>

      {podeEditar && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className={`${card} p-4`}>
            <h2 className="font-medium text-slate-900 mb-3">
              Assinatura do técnico
            </h2>
            {os.assinaturaTecnico ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={os.assinaturaTecnico}
                alt="Assinatura do técnico"
                className="w-full h-[180px] object-contain border border-slate-200 rounded-md bg-white"
              />
            ) : (
              <SignaturePad onSave={salvarAssinaturaTecnicoComId} />
            )}
          </div>
          <div className={`${card} p-4`}>
            <h2 className="font-medium text-slate-900 mb-3">
              Assinatura do cliente
            </h2>
            {os.assinaturaCliente ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={os.assinaturaCliente}
                alt="Assinatura do cliente"
                className="w-full h-[180px] object-contain border border-slate-200 rounded-md bg-white"
              />
            ) : (
              <SignaturePad onSave={salvarAssinaturaClienteComId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
