import { useCallback, useEffect, useState } from 'react'
import type { Template } from '@/types/template'
import * as templateService from '@/services/templateService'

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setTemplates(await templateService.getTemplates())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
      const t = await templateService.createTemplate(input)
      await reload()
      return t
    },
    [reload]
  )

  const update = useCallback(
    async (id: string, input: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>) => {
      await templateService.updateTemplate(id, input)
      await reload()
    },
    [reload]
  )

  const remove = useCallback(async (id: string) => {
    await templateService.deleteTemplate(id)
    await reload()
  }, [reload])

  const applyToTrip = useCallback(async (templateId: string, tripId: string) => {
    return templateService.applyTemplate(templateId, tripId)
  }, [])

  return { templates, loading, reload, create, update, remove, applyToTrip }
}
