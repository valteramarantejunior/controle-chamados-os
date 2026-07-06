"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";
import type { Prioridade, StatusChamado } from "@/generated/prisma/client";

export async function criarChamado(formData: FormData) {
  const user = await requireRole("ADMIN", "ATENDENTE", "TECNICO");

  const clienteId = String(formData.get("clienteId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (!clienteId || !titulo || !descricao) {
    throw new Error("Cliente, título e descrição são obrigatórios");
  }

  const chamado = await prisma.chamado.create({
    data: {
      clienteId,
      titulo,
      descricao,
      categoria: String(formData.get("categoria") ?? "").trim() || null,
      prioridade: (formData.get("prioridade") as Prioridade) || "MEDIA",
      atendenteId: (formData.get("atendenteId") as string) || user.id,
    },
  });

  revalidatePath("/chamados");
  redirect(`/chamados/${chamado.id}`);
}

export async function atualizarChamado(id: string, formData: FormData) {
  await requireRole("ADMIN", "ATENDENTE", "TECNICO");

  const status = formData.get("status") as StatusChamado;
  const isFechando = status === "RESOLVIDO" || status === "FECHADO";

  await prisma.chamado.update({
    where: { id },
    data: {
      titulo: String(formData.get("titulo") ?? "").trim(),
      descricao: String(formData.get("descricao") ?? "").trim(),
      categoria: String(formData.get("categoria") ?? "").trim() || null,
      prioridade: formData.get("prioridade") as Prioridade,
      status,
      atendenteId: (formData.get("atendenteId") as string) || null,
      fechadoEm: isFechando ? new Date() : null,
    },
  });

  revalidatePath("/chamados");
  revalidatePath(`/chamados/${id}`);
}

export async function adicionarInteracao(chamadoId: string, formData: FormData) {
  const user = await requireUser();
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  if (!mensagem) return;

  await prisma.interacaoChamado.create({
    data: { chamadoId, mensagem, autorId: user.id },
  });

  revalidatePath(`/chamados/${chamadoId}`);
}
