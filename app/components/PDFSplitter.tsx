'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileDropzone from './FileDropzone'
import { Download, Loader2 } from 'lucide-react'

export default function PDFSplitter() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [splitPdfs, setSplitPdfs] = useState<{ name: string; url: string }[]>([])

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1))
  }

  const removeFile = () => {
    setFiles([])
    setSplitPdfs([])
  }

  const splitPDF = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      
      const splitUrls: { name: string; url: string }[] = []

      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
        newPdf.addPage(copiedPage)
        
        const pdfBytes = await newPdf.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        splitUrls.push({
          name: `page-${i + 1}.pdf`,
          url
        })
      }

      setSplitPdfs(splitUrls)
    } catch (error) {
      console.error('Error splitting PDF:', error)
      alert('Error splitting PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadPage = (pageUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = pageUrl
    link.download = fileName
    link.click()
  }

  const downloadAll = () => {
    splitPdfs.forEach(({ url, name }, index) => {
      setTimeout(() => downloadPage(url, name), index * 100)
    })
  }

  return (
    <>
      <h2 className="text-4xl font-bold text-white mb-8 font-orbitron text-gradient max-w-4xl mx-auto">
        PDF Splitter
      </h2>
      
      <div className="max-w-4xl mx-auto">
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple={false}
          files={files}
          onRemoveFile={removeFile}
          title="Drop a PDF file here"
          description="Select a PDF file to split into individual pages"
        />

        {files.length > 0 && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={splitPDF}
              disabled={isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Splitting...
                </>
              ) : (
                'Split PDF'
              )}
            </button>
          </div>
        )}

        {splitPdfs.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-4 md:mb-0 font-orbitron">
                PDF Split Successfully! 🎉 ({splitPdfs.length} pages)
              </h3>
              <button
                onClick={downloadAll}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All Pages
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {splitPdfs.map((pdf, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white mb-1 font-space-grotesk">
                        {pdf.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        Page {index + 1}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadPage(pdf.url, pdf.name)}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors group-hover:scale-110 transform duration-200"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
