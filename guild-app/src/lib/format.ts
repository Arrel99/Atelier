export function formatCurrency(amount: number): string {
  const parts = Math.round(amount).toString().split('')
  const formatted: string[] = []
  for (let i = parts.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) formatted.unshift('.')
    formatted.unshift(parts[i])
  }
  return formatted.join('')
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}/${m}/${y}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${m}/${y} ${h}.${min}`
}

export function calcCompletenessScore(
  answers: Record<string, string>,
  template: { id: string; weight: number }[]
): number {
  let total = 0
  let earned = 0
  template.forEach(field => {
    total += field.weight
    const val = answers[field.id]
    if (val && val.trim().length > 0) {
      const bonus = val.length > 50 ? 1 : 0.7
      earned += field.weight * bonus
    }
  })
  return Math.round((earned / total) * 100)
}

export function calcCommission(amount: number, isPro: boolean): number {
  const rate = isPro ? 0.08 : 0.12
  return Math.ceil(amount * rate)
}
