import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { STATUS_CHAMADO_LABEL, PRIORIDADE_LABEL } from "@/lib/labels";

export async function GET() {
  await requireRole("ADMIN", "ATENDENTE");

  const chamados = await prisma.chamado.findMany({
    orderBy: { numero: "asc" },
    include: { cliente: true, atendente: true },
  });

  const linhas = [
    "numero;titulo;cliente;atendente;prioridade;status;criado_em;fechado_em",
    ...chamados.map((c) =>
      [
        c.numero,
        c.titulo.replace(/;/g, ","),
        c.cliente.nome.replace(/;/g, ","),
        c.atendente?.nome ?? "",
        PRIORIDADE_LABEL[c.prioridade],
        STATUS_CHAMADO_LABEL[c.status],
        c.createdAt.toISOString(),
        c.fechadoEm?.toISOString() ?? "",
      ].join(";")
    ),
  ];

  return new Response(linhas.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="chamados.csv"',
    },
  });
}
