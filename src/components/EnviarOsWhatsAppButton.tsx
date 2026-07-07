"use client";

import { useState } from "react";
import { btnSecondary } from "@/lib/ui";

export function EnviarOsWhatsAppButton({
  whatsappUrl,
  pdfUrl,
  pdfFileName,
  mensagem,
}: {
  whatsappUrl: string | null;
  pdfUrl: string;
  pdfFileName: string;
  mensagem: string;
}) {
  const [carregando, setCarregando] = useState(false);

  if (!whatsappUrl) {
    return (
      <span className="text-xs text-slate-400">
        Cadastre um telefone do cliente para enviar por WhatsApp
      </span>
    );
  }

  function baixarPdfEAbrirWhatsApp() {
    // Baixa o PDF sem abrir uma nova aba (evita que o navegador bloqueie o
    // segundo popup, que é o do WhatsApp).
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.open(whatsappUrl!, "_blank");
  }

  async function handleClick() {
    setCarregando(true);
    try {
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (nav.share && nav.canShare) {
        const res = await fetch(pdfUrl);
        const blob = await res.blob();
        const file = new File([blob], pdfFileName, { type: "application/pdf" });

        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], text: mensagem });
          return;
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // usuário cancelou o compartilhamento, não faz nada
        return;
      }
      // qualquer outro erro: cai no fallback abaixo
    } finally {
      setCarregando(false);
    }

    baixarPdfEAbrirWhatsApp();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={carregando}
      className={btnSecondary}
    >
      {carregando ? "Preparando..." : "Enviar por WhatsApp"}
    </button>
  );
}
