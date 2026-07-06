"use client";

import { btnSecondary } from "@/lib/ui";

export function EnviarOsWhatsAppButton({
  whatsappUrl,
  pdfUrl,
  pdfFileName,
}: {
  whatsappUrl: string | null;
  pdfUrl: string;
  pdfFileName: string;
}) {
  if (!whatsappUrl) {
    return (
      <span className="text-xs text-slate-400">
        Cadastre um telefone do cliente para enviar por WhatsApp
      </span>
    );
  }

  function handleClick() {
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

  return (
    <button type="button" onClick={handleClick} className={btnSecondary}>
      Enviar por WhatsApp
    </button>
  );
}
