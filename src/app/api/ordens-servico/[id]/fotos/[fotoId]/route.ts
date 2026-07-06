import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; fotoId: string }> }
) {
  const user = await requireUser();
  const { id, fotoId } = await params;

  const foto = await prisma.fotoOrdemServico.findUnique({
    where: { id: fotoId },
    include: { ordemServico: true },
  });

  if (!foto || foto.ordemServicoId !== id) {
    return new Response("Foto não encontrada", { status: 404 });
  }

  const podeVer =
    user.role === "ADMIN" ||
    user.role === "ATENDENTE" ||
    (user.role === "TECNICO" && foto.ordemServico.tecnicoId === user.id);

  if (!podeVer) {
    return new Response("Sem permissão", { status: 403 });
  }

  return new Response(new Uint8Array(foto.dados), {
    headers: {
      "Content-Type": foto.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
