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

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
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
