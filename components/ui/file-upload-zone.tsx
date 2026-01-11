"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUploadZone({ onFilesSelected }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles)
      setIsDragActive(false)
    },
    [onFilesSelected],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  })

  return (
    <motion.div
      {...getRootProps()}
      onDragEnter={() => setIsDragActive(true)}
      onDragLeave={() => setIsDragActive(false)}
      animate={
        isDragActive
          ? { scale: 1.02, borderColor: "#000000", backgroundColor: "#f5f5f5" }
          : { scale: 1, borderColor: "transparent", backgroundColor: "transparent" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      className="border-2 border-dashed border-gray-border rounded-lg p-12 text-center cursor-pointer transition-all hover:border-black hover:bg-gray-50"
    >
      <input {...getInputProps()} />
      <motion.div
        animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16v-8m-4 4h8M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </motion.div>
      <p className="font-serif text-lg mb-2">Drop invoices here or click to browse</p>
      <p className="text-sm text-gray-500">(PDF, PNG, JPG)</p>
    </motion.div>
  )
}
