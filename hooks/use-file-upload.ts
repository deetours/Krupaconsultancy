'use client'

import { useState, useCallback } from 'react'
import { handleFileUpload, UploadResult } from '@/lib/storage-client'
import { apiClient } from '@/lib/api-client'

// ============================================================================
// FILE UPLOAD HOOK
// ============================================================================

interface UseFileUploadOptions {
  bucket?: 'invoices' | 'documents'
  folder?: string
  onProgress?: (progress: number) => void
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>
  uploading: boolean
  error: string | null
  progress: number
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      try {
        setUploading(true)
        setError(null)
        setProgress(0)

        // Upload file to Supabase Storage
        const uploadResult = await handleFileUpload(
          file,
          options.bucket || 'invoices',
          options.folder,
          (progress) => {
            setProgress(progress)
            options.onProgress?.(progress)
          }
        )

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed')
        }

        // Create invoice entry in database
        const token = localStorage.getItem('token')
        const userId = localStorage.getItem('userId')
        const clientId = localStorage.getItem('currentClientId')

        if (!clientId) {
          throw new Error('No client selected')
        }

        const invoiceResult = await apiClient.createInvoice(
          {
            client_id: clientId,
            file_name: uploadResult.fileName,
            file_path: uploadResult.filePath,
            file_size: uploadResult.fileSize,
          },
          { token, userId }
        )

        if (!invoiceResult.success) {
          throw new Error('Failed to create invoice record')
        }

        setProgress(100)
        options.onSuccess?.(uploadResult)

        return uploadResult
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options.onError?.(errorMessage)
        return null
      } finally {
        setUploading(false)
      }
    },
    [options]
  )

  return { upload, uploading, error, progress }
}

/**
 * Hook for handling multiple file uploads
 */
export function useMultipleFileUpload(options: UseFileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [results, setResults] = useState<Record<string, UploadResult>>({})

  const uploadMultiple = useCallback(
    async (files: File[]) => {
      try {
        setUploading(true)
        setErrors({})
        setResults({})

        const uploadPromises = files.map((file) =>
          handleFileUpload(
            file,
            options.bucket || 'invoices',
            options.folder,
            (prog) => {
              setProgress((prev) => ({ ...prev, [file.name]: prog }))
              options.onProgress?.(prog)
            }
          ).then((result) => {
            if (result.success) {
              setResults((prev) => ({ ...prev, [file.name]: result }))
            } else {
              setErrors((prev) => ({ ...prev, [file.name]: result.error || 'Upload failed' }))
            }
            return result
          })
        )

        await Promise.all(uploadPromises)
      } catch (err) {
        console.error('Multiple upload error:', err)
      } finally {
        setUploading(false)
      }
    },
    [options]
  )

  return { uploadMultiple, uploading, errors, progress, results }
}
