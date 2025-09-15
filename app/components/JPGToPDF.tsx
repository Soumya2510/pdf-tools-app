'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import FileDropzone from './FileDropzone'
import { Download, Loader2 } from 'lucide-react'

export default function JPGToPDF() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const convertToPDF = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const pdf = new jsPDF()
      let isFirstPage = true

      for (const file of files) {
        const imageUrl = URL.createObjectURL(file)
        
        await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgAspectRatio = img.width / img.height
            const pdfAspectRatio = pdfWidth / pdfHeight
            
            let width, height
            if (imgAspectRatio > pdfAspectRatio) {
              width = pdfWidth
              height = pdfWidth / imgAspectRatio
            } else {
              height = pdfHeight
              width = pdfHeight * imgAspectRatio
            }
            
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            
            if (!isFirstPage) {
              pdf.addPage()
            }
            
            const x = (pdfWidth - width) / 2
            const y = (pdfHeight - height) / 2
            
            pdf.addImage(imgData, 'JPEG', x, y, width, height)
            isFirstPage = false
            
            URL.revokeObjectURL(imageUrl)
            resolve(void 0)
          }
          img.src = imageUrl
        })
      }

      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (error) {
      console.error('Error converting to PDF:', error)
      alert('Error converting images to PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = 'images-to-pdf.pdf'
      link.click()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-8 font-orbitron text-gradient">
        JPG to PDF Converter
      </h2>
      
      <FileDropzone
        onFilesAdded={handleFilesAdded}
        accept={{ 
          'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        }}
        files={files}
        onRemoveFile={removeFile}
        title="Drop image files here"
        description="Select JPG, PNG, or other image files to convert to PDF"
      />

      {files.length > 0 && (
        <div className="mt-8 flex gap-4">
          <button
            onClick={convertToPDF}
            disabled={isProcessing}
            className="btn-primary flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to PDF'
            )}
          </button>
        </div>
      )}

      {pdfUrl && (
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-2xl backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 font-orbitron">
            PDF Created Successfully! 🎉
          </h3>
          <button
            onClick={downloadPDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  )
}
