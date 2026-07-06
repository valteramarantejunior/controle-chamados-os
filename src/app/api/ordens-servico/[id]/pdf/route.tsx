import sharp from "sharp";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { OrdemServicoPdf } from "@/components/pdf/OrdemServicoPdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: {
      cliente: true,
      tecnico: true,
      chamado: true,
      itens: true,
      fotos: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!os) {
    return new Response("Ordem de serviço não encontrada", { status: 404 });
  }

  const podeVer =
    user.role === "ADMIN" ||
    user.role === "ATENDENTE" ||
    (user.role === "TECNICO" && os.tecnicoId === user.id);

  if (!podeVer) {
    return new Response("Sem permissão", { status: 403 });
  }

  const fotos = await Promise.all(
    os.fotos.map((foto) =>
      sharp(foto.dados)
        .rotate()
        .resize({ width: 500, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer()
    )
  );

  const buffer = await renderToBuffer(<OrdemServicoPdf os={os} fotos={fotos} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="OS-${os.numero}.pdf"`,
    },
  });
}
