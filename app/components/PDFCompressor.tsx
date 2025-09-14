'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileDropzone from './FileDropzone'
import { Download, Loader2 } from 'lucide-react'

export default function PDFCompressor() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressedPdf, setCompressedPdf] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1)) // Only allow one file
  }

  const removeFile = (index: number) => {
    setFiles([])
    setCompressedPdf(null)
  }

  const compressPDF = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const file = files[0]
      const originalSize = file.size
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      // Basic compression by re-saving the PDF
      // Note: This is a simple compression. For more advanced compression,
      // you would need server-side processing or more sophisticated libraries
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      })
      
      const blob = new Blob([compressedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setCompressedPdf({
        url,
        originalSize,
        compressedSize: blob.size
      })
    } catch (error) {
      console.error('Error compressing PDF:', error)
      alert('Error compressing PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadCompressedPDF = () => {
    if (compressedPdf) {
      const link = document.createElement('a')
      link.href = compressedPdf.url
      link.download = 'compressed-document.pdf'
      link.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const compressionRatio = compressedPdf 
    ? ((compressedPdf.originalSize - compressedPdf.compressedSize) / compressedPdf.originalSize * 100).toFixed(1)
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">PDF Compressor</h2>
        
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple={false}
          files={files}
          onRemoveFile={removeFile}
          title="Drop a PDF file here"
          description="Select a PDF file to compress and reduce its file size"
        />

        {files.length > 0 && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={compressPDF}
              disabled={isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compressing...
                </>
              ) : (
                'Compress PDF'
              )}
            </button>
          </div>
        )}

        {compressedPdf && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-4">PDF Compressed Successfully!</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Original Size</p>
                <p className="font-bold text-gray-900">{formatFileSize(compressedPdf.originalSize)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Compressed Size</p>
                <p className="font-bold text-green-600">{formatFileSize(compressedPdf.compressedSize)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Size Reduction</p>
                <p className="font-bold text-primary-600">{compressionRatio}%</p>
              </div>
            </div>
            
            <button
              onClick={downloadCompressedPDF}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Compressed PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
