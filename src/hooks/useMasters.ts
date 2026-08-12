import { useCallback, useEffect, useState } from 'react'
import type { MachineMaster, PurposeMaster } from '@/types/master'
import * as masterService from '@/services/masterService'

export function useMasters() {
  const [machines, setMachines] = useState<MachineMaster[]>([])
  const [purposes, setPurposes] = useState<PurposeMaster[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [m, p] = await Promise.all([masterService.getMachineMasters(), masterService.getPurposeMasters()])
      setMachines(m)
      setPurposes(p)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const addMachine = useCallback(async (name: string) => { await masterService.createMachineMaster(name); await reload() }, [reload])
  const editMachine = useCallback(async (id: string, name: string) => { await masterService.updateMachineMaster(id, name); await reload() }, [reload])
  const removeMachine = useCallback(async (id: string) => { await masterService.deleteMachineMaster(id); await reload() }, [reload])

  const addPurpose = useCallback(async (name: string) => { await masterService.createPurposeMaster(name); await reload() }, [reload])
  const editPurpose = useCallback(async (id: string, name: string) => { await masterService.updatePurposeMaster(id, name); await reload() }, [reload])
  const removePurpose = useCallback(async (id: string) => { await masterService.deletePurposeMaster(id); await reload() }, [reload])

  return {
    machines, purposes, loading, reload,
    addMachine, editMachine, removeMachine,
    addPurpose, editPurpose, removePurpose
  }
}
