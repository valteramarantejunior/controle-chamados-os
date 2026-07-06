import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Papel } from "@/generated/prisma/client";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...papeis: Papel[]) {
  const user = await requireUser();
  if (!papeis.includes(user.role)) redirect("/");
  return user;
}
