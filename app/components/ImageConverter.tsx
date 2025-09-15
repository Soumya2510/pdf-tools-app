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
    convertedImages.forEach(({ url, name }, index) => {
      setTimeout(() => downloadImage(url, name), index * 100)
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-8 font-orbitron text-gradient">
        Image Converter
      </h2>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-white mb-3 font-space-grotesk">
            Output Format
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full p-4 bg-white/10 backdrop-blur-sm border-none rounded-xl text-white font-space-grotesk focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="jpeg" className="bg-gray-800">JPEG</option>
            <option value="png" className="bg-gray-800">PNG</option>
            <option value="webp" className="bg-gray-800">WebP</option>
          </select>
        </div>
        
        {outputFormat !== 'png' && (
          <div>
            <label className="block text-lg font-semibold text-white mb-3 font-space-grotesk">
              Quality: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
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
        <div className="mt-8 flex gap-4">
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
        <div className="mt-8 p-6 bg-gradient-to-r from-teal-400/20 to-green-400/20 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-teal-400 mb-4 md:mb-0 font-orbitron">
              Images Converted Successfully! 🎉 ({convertedImages.length} files)
            </h3>
            <button
              onClick={downloadAll}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convertedImages.map((image, index) => (
              <div 
                key={index} 
                className="p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white mb-1 font-space-grotesk">
                      {image.name}
                    </p>
                    <p className="text-sm text-gray-300">
                      {outputFormat.toUpperCase()} format
                    </p>
                  </div>
                  <button
                    onClick={() => downloadImage(image.url, image.name)}
                    className="text-teal-400 hover:text-teal-300 font-medium transition-colors group-hover:scale-110 transform duration-200"
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
  )
}
