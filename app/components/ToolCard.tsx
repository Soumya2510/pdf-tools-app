import { LucideIcon } from 'lucide-react'

interface ToolCardProps {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  onClick: () => void
}

export default function ToolCard({ title, description, icon: Icon, gradient, onClick }: ToolCardProps) {
  return (
    <div 
      className="tool-card group"
      onClick={onClick}
    >
      <div className="tool-card-header">
        <div className={`tool-icon ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="tool-content flex-1">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      
      <div className="tool-card-footer">
        <span>Try it now →</span>
      </div>
    </div>
  )
}
