"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";
import type { StatusOS } from "@/generated/prisma/client";

export async function criarOrdemServico(formData: FormData) {
  await requireRole("ADMIN", "ATENDENTE");

  const clienteId = String(formData.get("clienteId") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (!clienteId || !descricao) {
    throw new Error("Cliente e descrição são obrigatórios");
  }

  const dataAgendada = formData.get("dataAgendada") as string;
  const chamadoId = formData.get("chamadoId") as string;

  const os = await prisma.ordemServico.create({
    data: {
      clienteId,
      descricao,
      chamadoId: chamadoId || null,
      tecnicoId: (formData.get("tecnicoId") as string) || null,
      dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    },
  });

  revalidatePath("/ordens-servico");
  redirect(`/ordens-servico/${os.id}`);
}

export async function atualizarOrdemServico(id: string, formData: FormData) {
  const user = await requireUser();

  const os = await prisma.ordemServico.findUnique({ where: { id } });
  if (!os) throw new Error("Ordem de serviço não encontrada");

  const podeEditarTudo = user.role === "ADMIN" || user.role === "ATENDENTE";
  const ehTecnicoResponsavel =
    user.role === "TECNICO" && os.tecnicoId === user.id;

  if (!podeEditarTudo && !ehTecnicoResponsavel) {
    throw new Error("Sem permissão para editar esta ordem de serviço");
  }

  const status = formData.get("status") as StatusOS;
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;
  const isConcluindo = status === "CONCLUIDA";

  if (podeEditarTudo) {
    const dataAgendada = formData.get("dataAgendada") as string;

    await prisma.ordemServico.update({
      where: { id },
      data: {
        descricao: String(formData.get("descricao") ?? "").trim(),
        tecnicoId: (formData.get("tecnicoId") as string) || null,
        status,
        dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
        dataConclusao: isConcluindo ? new Date() : null,
        observacoes,
      },
    });
  } else {
    await prisma.ordemServico.update({
      where: { id },
      data: {
        status,
        dataConclusao: isConcluindo ? new Date() : null,
        observacoes,
      },
    });
  }

  revalidatePath("/ordens-servico");
  revalidatePath(`/ordens-servico/${id}`);
}

async function recalcularValorOS(ordemServicoId: string) {
  const itens = await prisma.itemOrdemServico.findMany({
    where: { ordemServicoId },
    select: { quantidade: true, valorUnitario: true },
  });

  const total = itens.reduce(
    (soma, item) => soma + Number(item.valorUnitario) * item.quantidade,
    0
  );

  await prisma.ordemServico.update({
    where: { id: ordemServicoId },
    data: { valor: total },
  });
}

export async function adicionarItemOS(ordemServicoId: string, formData: FormData) {
  await requireRole("ADMIN", "ATENDENTE");

  const descricao = String(formData.get("descricao") ?? "").trim();
  const quantidade = Number(formData.get("quantidade") ?? 1);
  const valorUnitario = String(formData.get("valorUnitario") ?? "0");

  if (!descricao) return;

  await prisma.itemOrdemServico.create({
    data: { ordemServicoId, descricao, quantidade, valorUnitario },
  });
  await recalcularValorOS(ordemServicoId);

  revalidatePath(`/ordens-servico/${ordemServicoId}`);
  revalidatePath("/ordens-servico");
  revalidatePath("/relatorios");
}

export async function removerItemOS(ordemServicoId: string, itemId: string) {
  await requireRole("ADMIN", "ATENDENTE");
  await prisma.itemOrdemServico.delete({ where: { id: itemId } });
  await recalcularValorOS(ordemServicoId);

  revalidatePath(`/ordens-servico/${ordemServicoId}`);
  revalidatePath("/ordens-servico");
  revalidatePath("/relatorios");
}

async function requireAcessoOS(ordemServicoId: string) {
  const user = await requireUser();
  const os = await prisma.ordemServico.findUnique({
    where: { id: ordemServicoId },
  });
  if (!os) throw new Error("Ordem de serviço não encontrada");

  const podeEditarTudo = user.role === "ADMIN" || user.role === "ATENDENTE";
  const ehTecnicoResponsavel =
    user.role === "TECNICO" && os.tecnicoId === user.id;

  if (!podeEditarTudo && !ehTecnicoResponsavel) {
    throw new Error("Sem permissão para editar esta ordem de serviço");
  }

  return { user, os };
}

const MAX_FOTO_BYTES = 8 * 1024 * 1024;

export async function adicionarFotosOS(ordemServicoId: string, formData: FormData) {
  await requireAcessoOS(ordemServicoId);

  const arquivos = formData
    .getAll("fotos")
    .filter((v): v is File => v instanceof File && v.size > 0);

  for (const arquivo of arquivos) {
    if (!arquivo.type.startsWith("image/")) continue;
    if (arquivo.size > MAX_FOTO_BYTES) continue;

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    await prisma.fotoOrdemServico.create({
      data: {
        ordemServicoId,
        dados: buffer,
        mimeType: arquivo.type,
      },
    });
  }

  revalidatePath(`/ordens-servico/${ordemServicoId}`);
}

export async function removerFotoOS(ordemServicoId: string, fotoId: string) {
  await requireAcessoOS(ordemServicoId);
  await prisma.fotoOrdemServico.delete({ where: { id: fotoId } });
  revalidatePath(`/ordens-servico/${ordemServicoId}`);
}

function validarAssinaturaDataUrl(dataUrl: string) {
  if (!/^data:image\/png;base64,/.test(dataUrl)) {
    throw new Error("Assinatura inválida");
  }
}

export async function salvarAssinaturaTecnico(
  ordemServicoId: string,
  assinatura: string
) {
  await requireAcessoOS(ordemServicoId);
  validarAssinaturaDataUrl(assinatura);

  await prisma.ordemServico.update({
    where: { id: ordemServicoId },
    data: { assinaturaTecnico: assinatura },
  });

  revalidatePath(`/ordens-servico/${ordemServicoId}`);
}

export async function salvarAssinaturaCliente(
  ordemServicoId: string,
  assinatura: string
) {
  await requireAcessoOS(ordemServicoId);
  validarAssinaturaDataUrl(assinatura);

  await prisma.ordemServico.update({
    where: { id: ordemServicoId },
    data: { assinaturaCliente: assinatura },
  });

  revalidatePath(`/ordens-servico/${ordemServicoId}`);
}
