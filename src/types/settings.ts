export interface Settings {
  id: string // fixed singleton id: 'default'
  lastAutoBackupDate: string | null // YYYY-MM-DD
  [key: string]: unknown
}
