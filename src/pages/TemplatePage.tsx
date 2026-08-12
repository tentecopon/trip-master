import { Link } from 'react-router-dom'
import { useTemplates } from '@/hooks/useTemplates'
import { TemplateCard } from '@/components/template/TemplateCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/common/Button'

export function TemplatePage() {
  const { templates, loading, remove } = useTemplates()
  if (loading) return <Loading />

  return (
    <div className="page">
      <div className="page-header-row">
        <h1 className="page-title">テンプレート</h1>
        <Link to="/templates/new"><Button variant="primary">＋ 新規作成</Button></Link>
      </div>

      {templates.length === 0 && <EmptyState message="テンプレートはまだありません。" />}

      <div className="template-list">
        {templates.map(t => <TemplateCard key={t.id} template={t} onDelete={remove} />)}
      </div>
    </div>
  )
}
