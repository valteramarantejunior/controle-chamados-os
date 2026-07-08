"use client";

import { useRef, useState } from "react";
import { btnSecondary } from "@/lib/ui";

export function FotoUploadButtons({
  onUpload,
}: {
  onUpload: (formData: FormData) => Promise<void>;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErro(null);
    setEnviando(true);
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("fotos", file);
    }
    try {
      await onUpload(formData);
    } catch (err) {
      setErro(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível enviar a foto. Tente novamente."
      );
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        disabled={enviando}
        className={btnSecondary}
      >
        Tirar foto
      </button>
      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        disabled={enviando}
        className={btnSecondary}
      >
        Escolher da galeria
      </button>
      {enviando && <span className="text-sm text-slate-500">Enviando...</span>}
      {erro && <span className="text-sm text-red-600">{erro}</span>}
    </div>
  );
}
