export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function required(value: string | null | undefined, message: string): string | null {
  return value && value.trim().length > 0 ? null : message
}

export function collect(...results: (string | null)[]): Record<string, string> {
  const errors: Record<string, string> = {}
  results.forEach((r, i) => {
    if (r) errors[`field_${i}`] = r
  })
  return errors
}
