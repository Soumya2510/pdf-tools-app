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
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
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
    <>
      <h2 className="text-4xl font-bold text-white mb-8 font-orbitron text-gradient max-w-4xl mx-auto">
        PDF Merger
      </h2>
      
      <div className="max-w-4xl mx-auto">
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          accept={{ 'application/pdf': ['.pdf'] }}
          files={files}
          onRemoveFile={removeFile}
          title="Drop PDF files here"
          description="Select multiple PDF files to merge them into one document"
        />

        {files.length >= 2 && (
          <div className="mt-8 flex gap-4">
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
          <div className="mt-8 p-6 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-green-400 mb-4 font-orbitron">
              PDF Merged Successfully! 🎉
            </h3>
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
    </>
  )
}
