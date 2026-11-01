export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function formatKg(value: number) {
  return `${new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
  }).format(value)} kg`;
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}
