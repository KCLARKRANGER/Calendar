"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadIcon, FileIcon, HelpCircleIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSVUploaderProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
}

export function CSVUploader({ onFileUpload, isLoading }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file)
        onFileUpload(file)
      } else {
        alert("Please upload a CSV file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file)
        onFileUpload(file)
      } else {
        alert("Please upload a CSV file")
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card className={`border-2 border-dashed ${dragActive ? "border-primary" : "border-muted"} transition-colors`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center gap-4 text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center gap-2 text-sm">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <span>{selectedFile.name}</span>
              </div>
            ) : (
              <UploadIcon className="h-10 w-10 text-muted-foreground" />
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {selectedFile ? "File uploaded successfully" : "Upload your CSV task list"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedFile
                  ? "Your calendar has been updated with the task data"
                  : "Drag and drop your CSV file here, or click to browse"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isLoading}
              >
                {selectedFile ? "Upload another file" : "Browse files"}
              </Button>

              {selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                  }}
                >
                  Clear
                </Button>
              )}

              <Button variant="outline" onClick={() => setShowHelp(!showHelp)} size="icon" className="rounded-full">
                <HelpCircleIcon className="h-4 w-4" />
              </Button>
            </div>

            <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </div>
        </CardContent>
      </Card>

      {showHelp && (
        <Alert>
          <AlertDescription>
            <div className="text-sm space-y-2">
              <p>
                <strong>Required CSV Format:</strong>
              </p>
              <p>
                Your CSV file must include at least a <strong>Due Date</strong> column.
              </p>
              <p>
                If a <strong>Start Date</strong> column is not found, the Due Date will be used for both start and end
                dates.
              </p>
              <p>
                Other helpful columns include: Task Name, Task ID, Type of Work, Location, Quantity, and Material Type.
              </p>
              <p>
                Example header row: <code>Task ID,Task Name,Due Date,Type of work,Location,Quantity,Material Type</code>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
