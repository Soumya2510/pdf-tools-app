'use client'

import { useState } from 'react'
import Header from './components/Header'
import ToolCard from './components/ToolCard'
import PDFMerger from './components/PDFMerger'
import JPGToPDF from './components/JPGToPDF'
import PDFSplitter from './components/PDFSplitter'
import ImageConverter from './components/ImageConverter'
import PDFCompressor from './components/PDFCompressor'
import { 
  FileText, 
  Image, 
  Scissors, 
  RefreshCw, 
  Minimize2,
  Merge,
  Download,
  Upload,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react'

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const tools = [
    {
      id: 'pdf-merger',
      title: 'PDF Merger',
      description: 'Combine multiple PDF files into one document with professional quality',
      icon: Merge,
      component: PDFMerger,
      gradient: 'bg-blue-gradient'
    },
    {
      id: 'jpg-to-pdf',
      title: 'JPG to PDF',
      description: 'Convert JPG, PNG, and other images to PDF format instantly',
      icon: Image,
      component: JPGToPDF,
      gradient: 'bg-green-gradient'
    },
    {
      id: 'pdf-splitter',
      title: 'PDF Splitter',
      description: 'Split PDF files into separate pages with precision',
      icon: Scissors,
      component: PDFSplitter,
      gradient: 'bg-purple-gradient'
    },
    {
      id: 'image-converter',
      title: 'Image Converter',
      description: 'Convert between different image formats seamlessly',
      icon: RefreshCw,
      component: ImageConverter,
      gradient: 'bg-orange-gradient'
    },
    {
      id: 'pdf-compressor',
      title: 'PDF Compressor',
      description: 'Reduce PDF file size while maintaining quality',
      icon: Minimize2,
      component: PDFCompressor,
      gradient: 'bg-red-gradient'
    }
  ]

  const ActiveComponent = activeTool ? tools.find(tool => tool.id === activeTool)?.component : null

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="main-container">
        {!activeTool ? (
          <div className="animate-fade-in">
            <div className="hero-section">
              <h1 className="hero-title">
                PDF Tools
              </h1>
              <p className="hero-subtitle">
                Professional-grade PDF and image conversion tools. 
                Fast, secure, and completely free to use. Transform your documents with cutting-edge technology.
              </p>
            </div>

            <div className="tools-grid">
              {tools.map((tool, index) => (
                <div 
                  key={tool.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ToolCard
                    title={tool.title}
                    description={tool.description}
                    icon={tool.icon}
                    gradient={tool.gradient}
                    onClick={() => setActiveTool(tool.id)}
                  />
                </div>
              ))}
            </div>

            <div className="features-section">
              <h2 className="features-title">
                Why Choose Our PDF Tools?
              </h2>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon bg-blue-gradient">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3>Lightning Fast</h3>
                  <p>Process your files in seconds with our optimized algorithms and modern technology stack.</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon bg-green-gradient">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3>100% Secure</h3>
                  <p>Your files are processed locally in your browser. No uploads to servers, complete privacy guaranteed.</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon bg-purple-gradient">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3>Mobile Friendly</h3>
                  <p>Works perfectly on all devices - desktop, tablet, and mobile. Responsive design for everyone.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-6">
              <button
                onClick={() => setActiveTool(null)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                ← Back to Tools
              </button>
            </div>
            {ActiveComponent && <ActiveComponent />}
          </div>
        )}
      </main>
    </div>
  )
}
