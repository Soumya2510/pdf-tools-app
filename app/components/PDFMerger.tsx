'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileDropzone from './FileDropzone'
import { Download, Loader2 } from 'lucide-react'

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const mergePDFs = async () => {
    if (files.length < 2) return

    setIsProcessing(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setMergedPdfUrl(url)
    } catch (error) {
      console.error('Error merging PDFs:', error)
      alert('Error merging PDFs. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadMergedPDF = () => {
    if (mergedPdfUrl) {
      const link = document.createElement('a')
      link.href = mergedPdfUrl
      link.download = 'merged-document.pdf'
      link.click()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">PDF Merger</h2>
        
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          accept={{ 'application/pdf': ['.pdf'] }}
          files={files}
          onRemoveFile={removeFile}
          title="Drop PDF files here"
          description="Select multiple PDF files to merge them into one document"
        />

        {files.length >= 2 && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={mergePDFs}
              disabled={isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Merging...
                </>
              ) : (
                'Merge PDFs'
              )}
            </button>
          </div>
        )}

        {mergedPdfUrl && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">PDF Merged Successfully!</h3>
            <button
              onClick={downloadMergedPDF}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Merged PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
