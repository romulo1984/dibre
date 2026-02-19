/**
 * Formata uma data para exibição em pt-BR: "quarta-feira, 11 de fevereiro de 2026"
 */
export function formatGameDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Converte valor de input datetime-local para Date ou null
 */
export function parseDateTimeLocal(value: string): Date | null {
  if (!value || value.length < 16) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}
