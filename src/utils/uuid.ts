/** Central UUID generator — no external library, per implementation design §16. */
export function generateId(): string {
  return crypto.randomUUID()
}
