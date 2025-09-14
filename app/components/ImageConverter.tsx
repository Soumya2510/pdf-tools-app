'use client'

import { useState } from 'react'
import FileDropzone from './FileDropzone'
import { Download, Loader2 } from 'lucide-react'

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertedImages, setConvertedImages] = useState<{ name: string; url: string }[]>([])
  const [outputFormat, setOutputFormat] = useState('jpeg')
  const [quality, setQuality] = useState(0.9)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const convertImages = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const convertedUrls: { name: string; url: string }[] = []

      for (const file of files) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const img = new Image()
        
        await new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            const mimeType = `image/${outputFormat}`
            const dataUrl = canvas.toDataURL(mimeType, quality)
            
            // Convert data URL to blob
            fetch(dataUrl)
              .then(res => res.blob())
              .then(blob => {
                const url = URL.createObjectURL(blob)
                const fileName = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`)
                convertedUrls.push({ name: fileName, url })
                resolve(void 0)
              })
          }
          img.src = URL.createObjectURL(file)
        })
      }

      setConvertedImages(convertedUrls)
    } catch (error) {
      console.error('Error converting images:', error)
      alert('Error converting images. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = fileName
    link.click()
  }

  const downloadAll = () => {
    convertedImages.forEach(({ url, name }) => {
      setTimeout(() => downloadImage(url, name), 100)
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Converter</h2>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          
          {outputFormat !== 'png' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          accept={{ 
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
          }}
          files={files}
          onRemoveFile={removeFile}
          title="Drop image files here"
          description="Select images to convert to different formats"
        />

        {files.length > 0 && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={convertImages}
              disabled={isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert Images'
              )}
            </button>
          </div>
        )}

        {convertedImages.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-green-900">
                Images Converted Successfully! ({convertedImages.length} files)
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
              {convertedImages.map((image, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border">
                  <p className="font-medium text-gray-900 mb-2">{image.name}</p>
                  <button
                    onClick={() => downloadImage(image.url, image.name)}
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
