import { Link } from 'react-router-dom'
import type { Template } from '@/types/template'
import { Button } from '@/components/common/Button'

interface Props {
  template: Template
  onDelete: (id: string) => void
}

export function TemplateCard({ template, onDelete }: Props) {
  return (
    <div className="template-card">
      <Link to={`/templates/${template.id}`} className="template-card-main">
        <div className="template-card-title">{template.templateName}</div>
        <div className="template-card-sub">{template.machineName} / {template.purposeName}</div>
        <div className="template-card-sub">ToDo {template.todos.length}件</div>
      </Link>
      <Button variant="danger" onClick={() => onDelete(template.id)}>削除</Button>
    </div>
  )
}
