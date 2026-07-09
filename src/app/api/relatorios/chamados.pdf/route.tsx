import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { RelatorioChamadosPdf } from "@/components/pdf/RelatorioChamadosPdf";

export async function GET(request: Request) {
  await requireRole("ADMIN", "ATENDENTE");

  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get("clienteId") || undefined;

  const [chamados, cliente] = await Promise.all([
    prisma.chamado.findMany({
      where: { clienteId },
      orderBy: { numero: "asc" },
      include: { cliente: true, atendente: true },
    }),
    clienteId
      ? prisma.cliente.findUnique({
          where: { id: clienteId },
          select: { nome: true },
        })
      : null,
  ]);

  const buffer = await renderToBuffer(
    <RelatorioChamadosPdf chamados={chamados} clienteFiltro={cliente?.nome} />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="relatorio-chamados.pdf"',
    },
  });
}
