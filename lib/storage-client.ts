import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'

// ============================================================================
// SUPABASE STORAGE - File upload and management
// ============================================================================

export interface UploadOptions {
  bucket: 'invoices' | 'documents'
  folder?: string
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  success: boolean
  filePath?: string
  fileName?: string
  fileSize?: number
  error?: string
}

class StorageClient {
  private supabase = createClient()

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
    try {
      if (!file) {
        return { success: false, error: 'No file provided' }
      }

      // Validate file size (max 50MB)
      const MAX_FILE_SIZE = 50 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: 'File size exceeds 50MB limit' }
      }

      // Generate file path
      const fileName = `${nanoid(8)}-${file.name}`
      const timestamp = new Date()
      const year = timestamp.getFullYear()
      const month = String(timestamp.getMonth() + 1).padStart(2, '0')

      let filePath = `${year}/${month}/${fileName}`
      if (options.folder) {
        filePath = `${options.folder}/${filePath}`
      }

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        return { success: false, error: error.message }
      }

      return {
        success: true,
        filePath: data.path,
        fileName: file.name,
        fileSize: file.size,
      }
    } catch (error) {
      console.error('Upload exception:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error',
      }
    }
  }

  /**
   * Get signed download URL for file
   */
  async getSignedUrl(filePath: string, bucket: 'invoices' | 'documents' = 'invoices', expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn)

      return data?.signedUrl || null
    } catch (error) {
      console.error('Get signed URL error:', error)
      return null
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string, bucket: 'invoices' | 'documents' = 'invoices'): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Delete exception:', error)
      return false
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string, bucket: 'invoices' | 'documents' = 'invoices') {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) {
        console.error('List error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('List exception:', error)
      return null
    }
  }
}

export const storageClient = new StorageClient()

/**
 * Utility function to handle file uploads with validation
 */
export async function handleFileUpload(
  file: File,
  bucket: 'invoices' | 'documents' = 'invoices',
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // Validate file type
  const allowedInvoiceTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

  const allowedTypes = bucket === 'invoices' ? allowedInvoiceTypes : allowedDocumentTypes

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  // Upload file
  return storageClient.uploadFile(file, {
    bucket,
    folder,
    onProgress,
  })
}
