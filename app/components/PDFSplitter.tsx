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
    setFiles(newFiles.slice(0, 1)) // Only allow one file
  }

  const removeFile = (index: number) => {
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
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
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
    splitPdfs.forEach(({ url, name }) => {
      setTimeout(() => downloadPage(url, name), 100)
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">PDF Splitter</h2>
        
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
          <div className="mt-6 flex gap-4">
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-green-900">
                PDF Split Successfully! ({splitPdfs.length} pages)
              </h3>
              <button
                onClick={downloadAll}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {splitPdfs.map((pdf, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border">
                  <p className="font-medium text-gray-900 mb-2">{pdf.name}</p>
                  <button
                    onClick={() => downloadPage(pdf.url, pdf.name)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Download →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
