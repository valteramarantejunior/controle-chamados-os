import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { card, btnPrimary, input } from "@/lib/ui";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { telefone: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
    include: { _count: { select: { chamados: true, ordensServico: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
        <Link href="/clientes/novo" className={btnPrimary}>
          Novo Cliente
        </Link>
      </div>

      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className={`${input} max-w-sm`}
        />
      </form>

      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Chamados</th>
              <th className="px-4 py-3 font-medium">OS</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {cliente.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {cliente.telefone ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {cliente.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {cliente._count.chamados}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {cliente._count.ordensServico}
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
