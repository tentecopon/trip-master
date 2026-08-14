import type { TripPhase } from '@/types/trip'

/** YYYY-MM-DD in local device time (never UTC), per implementation design §57. */
export function todayStr(): string {
  const d = new Date()
  return dateToStr(d)
}

export function dateToStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Adds calendar days to a YYYY-MM-DD string in local time (not UTC). */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return dateToStr(new Date(year, month - 1, day + days))
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function nowTimeStr(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Trip phase is derived on the fly — status===completed short-circuits to 'completed'. §58 */
export function getTripPhase(
  status: 'active' | 'completed',
  startDate: string,
  endDate: string,
  today: string = todayStr()
): TripPhase {
  if (status === 'completed') return 'completed'
  if (today < startDate) return 'before'
  if (today > endDate) return 'after'
  return 'onsite'
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

export function formatDateJp(dateStr: string | null): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${y}/${m}/${d}`
}
