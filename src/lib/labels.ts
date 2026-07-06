export const STATUS_CHAMADO_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_CLIENTE: "Aguardando cliente",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

export const STATUS_CHAMADO_COLOR: Record<string, string> = {
  ABERTO: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-amber-100 text-amber-700",
  AGUARDANDO_CLIENTE: "bg-purple-100 text-purple-700",
  RESOLVIDO: "bg-green-100 text-green-700",
  FECHADO: "bg-slate-200 text-slate-600",
};

export const PRIORIDADE_LABEL: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

export const PRIORIDADE_COLOR: Record<string, string> = {
  BAIXA: "bg-slate-100 text-slate-600",
  MEDIA: "bg-amber-100 text-amber-700",
  ALTA: "bg-red-100 text-red-700",
};

export const STATUS_OS_LABEL: Record<string, string> = {
  ABERTA: "Aberta",
  EM_EXECUCAO: "Em execução",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const STATUS_OS_COLOR: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-700",
  EM_EXECUCAO: "bg-amber-100 text-amber-700",
  CONCLUIDA: "bg-green-100 text-green-700",
  CANCELADA: "bg-slate-200 text-slate-600",
};

export const PAPEL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  ATENDENTE: "Atendente",
  TECNICO: "Técnico",
};

export const TIMEZONE = "America/Sao_Paulo";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

/**
 * Converte o valor de um <input type="datetime-local"> (ex: "2026-07-10T14:00"),
 * tratado como horário de São Paulo, para o instante UTC correto — independente
 * do fuso horário configurado no servidor onde a aplicação roda.
 */
export function parseSaoPauloDateTimeInput(value: string): Date {
  return new Date(`${value}:00-03:00`);
}

/**
 * Converte uma data/hora (armazenada em UTC) para o valor de string esperado
 * por um <input type="datetime-local">, exibindo o horário de São Paulo.
 */
export function toSaoPauloDateTimeInputValue(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
