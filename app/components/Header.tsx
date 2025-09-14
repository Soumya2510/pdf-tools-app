import { FileText } from 'lucide-react'

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-logo">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="header-text">
          <h1>PDF Tools</h1>
          <p>Free Online Converter</p>
        </div>
      </div>
    </header>
  )
}
