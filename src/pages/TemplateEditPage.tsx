import { useNavigate, useParams } from 'react-router-dom'
import { useTemplates } from '@/hooks/useTemplates'
import { useMasters } from '@/hooks/useMasters'
import { TemplateForm } from '@/components/template/TemplateForm'
import { Loading } from '@/components/common/Loading'
import { useToast } from '@/components/common/Toast'
import type { Template } from '@/types/template'

export function TemplateEditPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { templates, loading, create, update } = useTemplates()
  const { machines, purposes } = useMasters()
  const { show } = useToast()

  if (loading) return <Loading />

  const isNew = templateId === 'new' || !templateId
  const existing: Template | undefined = isNew ? undefined : templates.find(t => t.id === templateId)

  if (!isNew && !existing) return <div className="page"><p>テンプレートが見つかりませんでした。</p></div>

  async function handleSave(input: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      if (isNew) {
        await create(input)
      } else if (existing) {
        await update(existing.id, input)
      }
      navigate('/templates')
    } catch {
      show('データを保存できませんでした。', 'error')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">{isNew ? 'テンプレート作成' : 'テンプレート編集'}</h1>
      <TemplateForm machines={machines} purposes={purposes} initial={existing} onSave={handleSave} />
    </div>
  )
}
