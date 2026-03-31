"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { CloudUpload } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SearchBar } from "./SearchBar"
import { BreadcrumbNav } from "@/components/BreadCrumbNav"
import { UploadButton } from "@/components/UploadButton"
import { FileTable } from "./FileTable"
import { TableSkeleton } from "@/components/TableSkeleton"
import { type Node, type BreadcrumbItem } from "@/lib/types"

interface StorageLayoutProps {
  items: Node[]
  initialFolderId: string | null
  breadcrumbPath: BreadcrumbItem[]
}

export function StorageLayout({
  items,
  breadcrumbPath,
}: StorageLayoutProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const handleFolderClick = (folderId: string) => {
    router.push(`/folder/${folderId}`)
  }

  const handleBreadcrumbNavigate = (index: number) => {
    const target = breadcrumbPath[index]
    if (target.id === null) {
      router.push("/")
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
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    console.log(
      "Files dropped:",
      Array.from(e.dataTransfer.files).map((f) => f.name)
    )
  }

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
        <div className=" border-b bg-background">
          <div className="space-y-4 p-6">
          {/* <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        /> */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="flex items-center justify-between gap-4">
              <BreadcrumbNav
                path={breadcrumbPath}
                onNavigate={handleBreadcrumbNavigate}
              />
              <UploadButton />
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
