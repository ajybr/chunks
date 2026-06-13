"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CloudUpload, FolderPlus } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress"
import { SearchBar } from "./SearchBar"
import { BreadcrumbNav } from "@/components/BreadcrumbNav"
import { UploadButton } from "@/components/UploadButton"
import { NewFolderDialog } from "@/components/NewFolderDialog"
import { FileTable } from "./FileTable"
import { type Node, type BreadcrumbItem } from "@/lib/types"
import { uploadFile } from "@/server/upload"

interface StorageLayoutProps {
  items: Node[]
  initialFolderId: string | null
  breadcrumbPath: BreadcrumbItem[]
}

export function StorageLayout({
  items,
  initialFolderId: _initialFolderId,
  breadcrumbPath,
}: StorageLayoutProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const dragCounterRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFolderClick = (folderId: string) => {
    router.push(`/folder/${folderId}`)
  }

  const handleBreadcrumbNavigate = (index: number) => {
    const target = breadcrumbPath[index]
    if (target.id === null) {
      router.push("/home")
    } else {
      router.push(`/folder/${target.id}`)
    }
  }



  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault()

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!isLoaded || !user) return
      const fileList = Array.from(files)
      const totalFiles = fileList.length
      let filesDone = 0

      setUploading(true)

      const progressId = toast.custom(
        () => (
          <div className="flex flex-col gap-2 w-72">
            <p className="text-sm font-medium">
              Uploading 0/{totalFiles} files
            </p>
            <ProgressRoot value={0}>
              <ProgressTrack>
                <ProgressIndicator style={{ width: "0%" }} />
              </ProgressTrack>
            </ProgressRoot>
          </div>
        ),
        { duration: Infinity, position: "bottom-right" }
      )

      let overallPercent = 0

      for (const file of fileList) {
        try {
          const nodeRes = await fetch("/api/nodes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              parent_id: _initialFolderId ?? null,
              size: file.size,
              mime_type: file.type || "application/octet-stream",
            }),
          })

          if (!nodeRes.ok) {
            const err = await nodeRes.json().catch(() => ({}))
            throw new Error(err.error ?? "Failed to create node")
          }

          const { id: nodeId } = await nodeRes.json()

          await uploadFile(file, nodeId, (progress) => {
            const filePct =
              progress.total > 0
                ? Math.round(
                    ((progress.uploaded + progress.skipped) / progress.total) *
                      100
                  )
                : 0
            overallPercent = Math.round(
              ((filesDone + filePct / 100) / totalFiles) * 100
            )
            toast.custom(
              () => (
                <div className="flex flex-col gap-2 w-72">
                  <p className="text-sm font-medium">
                    Uploading {filesDone}/{totalFiles} files &middot;{" "}
                    {progress.uploaded + progress.skipped}/{progress.total}{" "}
                    chunks
                  </p>
                  <ProgressRoot value={overallPercent}>
                    <ProgressTrack>
                      <ProgressIndicator
                        style={{ width: `${overallPercent}%` }}
                      />
                    </ProgressTrack>
                  </ProgressRoot>
                </div>
              ),
              { id: progressId, duration: Infinity, position: "bottom-right" }
            )
          })

          filesDone++
          toast.success(`${file.name} uploaded successfully`, {
            position: "bottom-right",
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed"
          toast.error(`${file.name}: ${msg}`, {
            position: "bottom-right",
          })
        }
      }

      toast.dismiss(progressId)
      setUploading(false)
      router.refresh()
    },
    [isLoaded, user, _initialFolderId, router]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      dragCounterRef.current = 0
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
      }
      e.target.value = ""
    },
    [processFiles]
  )

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isEmptyState = filteredItems.length === 0 && searchQuery === ""

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex-1 overflow-hidden transition-colors ${isDragging ? "bg-accent/10" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="border-b bg-background">
        <div className="space-y-4 p-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center justify-between gap-4">
            <BreadcrumbNav
              path={breadcrumbPath}
              onNavigate={handleBreadcrumbNavigate}
            />
            <div className="flex items-center gap-2">
              <NewFolderDialog parentId={_initialFolderId}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <FolderPlus className="h-4 w-4" />
                  New Folder
                </Button>
              </NewFolderDialog>
              <UploadButton onClick={handleUploadClick} disabled={uploading} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto p-6">
        {isEmptyState ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CloudUpload className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No files yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Drag and drop files here or click the upload button to start
              storing your files
            </p>
          </div>
        ) : (
          <FileTable
            items={filteredItems}
            onFolderClick={handleFolderClick}
          />
        )}
      </div>
    </div>
  )
}
