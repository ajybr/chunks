"use client"

import { useState, useRef } from "react"
import { CloudUpload } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SearchBar } from "./SearchBar"
import { BreadcrumbNav } from "@/components/BreadCrumbNav"
import { UploadButton } from "@/components/UploadButton"
import { FileTable } from "./FileTable"
import { TableSkeleton } from "@/components/TableSkeleton"
import { StorageItem } from "@/lib/types"

interface StorageLayoutProps {
  items: StorageItem[]
}

export function StorageLayout({ items }: StorageLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFolderId, setCurrentFolderId] = useState("root")
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    { id: string; name: string }[]
  >([{ id: "root", name: "My Files" }])
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const filteredItems = items.filter(
    (item) =>
      item.parent === currentFolderId &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFolderClick = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId)
    setBreadcrumbPath([...breadcrumbPath, { id: folderId, name: folderName }])
    setSearchQuery("")
  }

  const handleBreadcrumbNavigate = (index: number) => {
    const targetFolder = breadcrumbPath[index]
    setCurrentFolderId(targetFolder.id)
    setBreadcrumbPath(breadcrumbPath.slice(0, index + 1))
    setSearchQuery("")
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)

    const files = e.dataTransfer.files
    console.log(
      "[v0] Files dropped:",
      Array.from(files).map((f) => f.name)
    )

    // Simulate upload delay
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const isEmptyState = filteredItems.length === 0 && searchQuery === ""

  return (
    <SidebarInset>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex-1 overflow-hidden transition-colors ${
          isDragging ? "bg-accent/10" : ""
        }`}
      >
        {/* Header Section */}
        <div className="sticky top-0 z-40 border-b bg-background">
          <div className="space-y-4 p-6">
            {/* Search Bar */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* Breadcrumbs and Upload Button */}
            <div className="flex items-center justify-between gap-4">
              <BreadcrumbNav
                path={breadcrumbPath}
                onNavigate={handleBreadcrumbNavigate}
              />
              <UploadButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
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
          ) : isLoading ? (
            <TableSkeleton />
          ) : (
            <FileTable
              items={filteredItems}
              onFolderClick={handleFolderClick}
            />
          )}
        </div>
      </div>
    </SidebarInset>
  )
}
