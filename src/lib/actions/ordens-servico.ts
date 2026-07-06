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
  const valor = formData.get("valor") as string;
  const chamadoId = formData.get("chamadoId") as string;

  const os = await prisma.ordemServico.create({
    data: {
      clienteId,
      descricao,
      chamadoId: chamadoId || null,
      tecnicoId: (formData.get("tecnicoId") as string) || null,
      dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
      valor: valor ? valor : null,
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
    const valor = formData.get("valor") as string;

    await prisma.ordemServico.update({
      where: { id },
      data: {
        descricao: String(formData.get("descricao") ?? "").trim(),
        tecnicoId: (formData.get("tecnicoId") as string) || null,
        status,
        dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
        dataConclusao: isConcluindo ? new Date() : null,
        valor: valor ? valor : null,
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

export async function adicionarItemOS(ordemServicoId: string, formData: FormData) {
  await requireRole("ADMIN", "ATENDENTE");

  const descricao = String(formData.get("descricao") ?? "").trim();
  const quantidade = Number(formData.get("quantidade") ?? 1);
  const valorUnitario = String(formData.get("valorUnitario") ?? "0");

  if (!descricao) return;

  await prisma.itemOrdemServico.create({
    data: { ordemServicoId, descricao, quantidade, valorUnitario },
  });

  revalidatePath(`/ordens-servico/${ordemServicoId}`);
}

export async function removerItemOS(ordemServicoId: string, itemId: string) {
  await requireRole("ADMIN", "ATENDENTE");
  await prisma.itemOrdemServico.delete({ where: { id: itemId } });
  revalidatePath(`/ordens-servico/${ordemServicoId}`);
}
