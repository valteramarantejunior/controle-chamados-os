"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function readClienteForm(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório");

  return {
    nome,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    endereco: String(formData.get("endereco") ?? "").trim() || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function criarCliente(formData: FormData) {
  await requireUser();
  const data = readClienteForm(formData);
  const cliente = await prisma.cliente.create({ data });
  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}`);
}

export async function atualizarCliente(id: string, formData: FormData) {
  await requireUser();
  const data = readClienteForm(formData);
  await prisma.cliente.update({ where: { id }, data });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}
