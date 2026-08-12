import { useCallback, useEffect, useState } from 'react'
import type { Backup } from '@/types/backup'
import * as backupService from '@/services/backupService'
import { readTextFile } from '@/utils/file'

export function useBackup() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setBackups(await backupService.getBackups())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const exportNow = useCallback(async () => {
    await backupService.exportBackup()
    await reload()
  }, [reload])

  /** Validates the picked file without restoring — used to drive the confirmation dialog. */
  const validateFile = useCallback(async (file: File) => {
    const raw = await readTextFile(file)
    return { raw, outcome: backupService.validateBackup(raw) }
  }, [])

  const restore = useCallback(async (raw: string) => {
    await backupService.restoreBackup(raw)
    await reload()
  }, [reload])

  return { backups, loading, reload, exportNow, validateFile, restore }
}
