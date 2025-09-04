import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image } from 'lucide-react'

const ImageUploader = ({ onImageUpload, variant = 'dropzone', className = '' }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onImageUpload({
          file,
          url: reader.result,
          name: file.name
        })
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  })

  if (variant === 'button') {
    return (
      <div {...getRootProps()} className={`inline-block ${className}`}>
        <input {...getInputProps()} />
        <button
          type="button"
          className="btn-secondary flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary bg-blue-50'
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
      } ${className}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isDragActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          <Image className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-medium text-text-primary">
            {isDragActive ? 'Drop your image here' : 'Upload product image'}
          </p>
          <p className="text-text-secondary mt-1">
            Drag and drop or click to browse
          </p>
          <p className="text-sm text-text-secondary mt-2">
            Supports JPG, PNG, GIF, WebP (max 10MB)
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageUploader