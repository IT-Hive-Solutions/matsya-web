"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface ImageUploadProps {
  label: string
  onImageChange?: (file: File | null) => void
  onImagesChange?: (files: File[]) => void
  multiple?: boolean
  maxSizeInMB?: number
  acceptedFormats?: string[]
}

export default function ImageUpload({
  label,
  onImageChange,
  onImagesChange,
  multiple = false,
  maxSizeInMB = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = e.target.files

    if (!files) return

    if (!multiple && files.length > 0) {
      const file = files[0]
      validateAndSetFile(file, onImageChange, (url) => setPreview(url))
    } else if (multiple) {
      const fileArray = Array.from(files)
      const validFiles: File[] = []
      const newPreviews: string[] = []

      fileArray.forEach((file) => {
        if (validateFile(file)) {
          validFiles.push(file)
          const reader = new FileReader()
          reader.onload = (event) => {
            newPreviews.push(event.target?.result as string)
            if (newPreviews.length === validFiles.length) {
              setPreviews(newPreviews)
              onImagesChange?.(validFiles)
            }
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  const validateFile = (file: File): boolean => {
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid format. Accepted: ${acceptedFormats.join(", ")}`)
      return false
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      setError(`File size exceeds ${maxSizeInMB}MB`)
      return false
    }

    return true
  }

  const validateAndSetFile = (
    file: File,
    callback?: (file: File | null) => void,
    previewCallback?: (url: string) => void,
  ) => {
    if (!validateFile(file)) return

    callback?.(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      previewCallback?.(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">{label}</label>

      <div className="relative">
        <input
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(",")}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Card className="p-6 border-2 border-dashed border-border hover:border-primary transition text-center cursor-pointer">
          <p className="text-2xl mb-2">📷</p>
          <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to {maxSizeInMB}MB</p>
        </Card>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Single Image Preview */}
      {preview && !multiple && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Multiple Images Preview */}
      {previews.length > 0 && multiple && (
        <div className="grid grid-cols-2 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative h-32 rounded-lg overflow-hidden border border-border">
              <img
                src={preview || "/placeholder.svg"}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
