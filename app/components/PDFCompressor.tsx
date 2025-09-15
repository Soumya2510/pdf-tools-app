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
    setFiles(newFiles.slice(0, 1))
  }

  const removeFile = () => {
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
      
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      })
      
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' })
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
    <>
      <h2 className="text-4xl font-bold text-white mb-8 font-orbitron text-gradient max-w-4xl mx-auto">
        PDF Compressor
      </h2>
      
      <div className="max-w-4xl mx-auto">
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
          <div className="mt-8 flex gap-4">
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
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-purple-400 mb-6 font-orbitron">
              PDF Compressed Successfully! 🎉
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-1">Original Size</p>
                <p className="text-lg font-bold text-white font-jetbrains-mono">
                  {formatFileSize(compressedPdf.originalSize)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-1">Compressed Size</p>
                <p className="text-lg font-bold text-green-400 font-jetbrains-mono">
                  {formatFileSize(compressedPdf.compressedSize)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-1">Size Reduction</p>
                <p className="text-lg font-bold text-blue-400 font-jetbrains-mono">
                  {compressionRatio}%
                </p>
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
    </>
  )
}
