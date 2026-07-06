"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { Papel } from "@/generated/prisma/client";

export async function criarUsuario(formData: FormData) {
  await requireRole("ADMIN");

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const papel = formData.get("papel") as Papel;

  if (!nome || !email || senha.length < 6) {
    throw new Error("Nome, e-mail e senha (mín. 6 caracteres) são obrigatórios");
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.user.create({
    data: { nome, email, senhaHash, papel },
  });

  revalidatePath("/usuarios");
}

export async function alternarAtivoUsuario(id: string, ativo: boolean) {
  await requireRole("ADMIN");
  await prisma.user.update({ where: { id }, data: { ativo } });
  revalidatePath("/usuarios");
}
