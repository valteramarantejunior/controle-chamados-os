"use client";

import { useRef, useState } from "react";
import { btnPrimary, btnSecondary } from "@/lib/ui";

export function SignaturePad({
  onSave,
}: {
  onSave: (dataUrl: string) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    setSaved(false);
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setIsEmpty(false);
  }

  function end() {
    drawingRef.current = false;
  }

  function limpar() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setSaved(false);
  }

  async function salvar() {
    if (isEmpty) return;
    setSaving(true);
    try {
      const dataUrl = canvasRef.current!.toDataURL("image/png");
      await onSave(dataUrl);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={180}
        className="w-full rounded-md border border-slate-300 bg-white touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="flex items-center gap-3 mt-2">
        <button type="button" onClick={limpar} className={btnSecondary}>
          Limpar
        </button>
        <button
          type="button"
          onClick={salvar}
          disabled={isEmpty || saving}
          className={btnPrimary}
        >
          {saving ? "Salvando..." : "Salvar assinatura"}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Assinatura salva.</span>
        )}
      </div>
    </div>
  );
}
