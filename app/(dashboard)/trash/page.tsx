"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  File,
  Folder,
  Ellipsis,
  Download,
  RotateCcw,
  Delete,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { SearchBar } from "@/components/SearchBar"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import type { Node } from "@/lib/types"

export default function TrashPage() {
  const router = useRouter()
  const [items, setItems] = useState<Node[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Node | null>(null)
  const { user } = useUser()

  useEffect(() => {
    async function fetchDeleted() {
      try {
        const res = await fetch("/api/trash")
        if (res.ok) {
          const data = await res.json()
          setItems(data.items ?? [])
        }
      } catch (err) {
        console.error("Failed to fetch deleted items:", err)
      }
    }
    fetchDeleted()
  }, [])

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "\u2014"
    const d = typeof date === "string" ? new Date(date) : date
    if (isNaN(d.getTime())) return "\u2014"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(1)} GB`
  }

  const handleMenuAction = async (action: string, item: Node) => {
    setOpenMenuId(null)

    switch (action) {
      case "restore": {
        try {
          const res = await fetch(`/api/nodes/${item.id}/restore`, { method: "POST" })
          if (!res.ok) throw new Error("Failed to restore")
          toast.success("Restored from trash", { position: "bottom-right" })
          setItems((prev) => prev.filter((i) => i.id !== item.id))
          router.refresh()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to restore", { position: "bottom-right" })
        }
        break
      }
      case "download": {
        window.open(`/api/nodes/${item.id}/download`, "_blank")
        break
      }
      case "permanent-delete": {
        setDeleteTarget(item)
        break
      }
    }
  }

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/nodes/${deleteTarget.id}/delete`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to permanently delete")
      toast.success("Permanently deleted", { position: "bottom-right" })
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to permanently delete", { position: "bottom-right" })
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isEmptyState = filteredItems.length === 0 && searchQuery === ""

  return (
    <div>
      <div className="border-b bg-background">
        <div className="space-y-4 p-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>
      <div className="overflow-auto p-6">
        {isEmptyState ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Trash2 className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">
              Files deleted from your storage will appear here
            </p>
          </div>
        ) : (
          <div className="rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="w-32">Size</TableHead>
                  <TableHead className="w-40">Deleted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="flex gap-3 py-4 align-middle font-medium">
                      {item.type === "folder" ? (
                        <Folder className="h-5 w-5 text-amber-500" />
                      ) : (
                        <File className="h-5 w-5 text-blue-500" />
                      )}
                      {item.name}
                    </TableCell>
                    <TableCell className="py-4 align-middle text-sm text-muted-foreground">
                      {user?.fullName ?? item.owner}
                    </TableCell>
                    <TableCell className="py-4 align-middle text-sm text-muted-foreground">
                      {item.type === "folder"
                        ? "\u2014"
                        : formatFileSize(item.size ?? 0)}
                    </TableCell>
                    <TableCell className="py-4 align-middle text-sm text-muted-foreground">
                      {item.deleted_at
                        ? formatDate(item.deleted_at)
                        : formatDate(item.modified_at)}
                    </TableCell>
                    <TableCell>
                      {hoveredId === item.id && (
                        <DropdownMenu
                          open={openMenuId === item.id}
                          onOpenChange={(open) =>
                            setOpenMenuId(open ? item.id : null)
                          }
                        >
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                            <Ellipsis className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </span>
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleMenuAction("restore", item)}
                              className="gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMenuAction("download", item)}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                handleMenuAction("permanent-delete", item)
                              }
                              className="gap-2"
                            >
                              <Delete className="h-4 w-4" />
                              Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AlertDialog
              open={deleteTarget !== null}
              onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete permanently</AlertDialogTitle>
                  <AlertDialogDescription>
                    Permanently delete &ldquo;{deleteTarget?.name}&rdquo;? This cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handlePermanentDelete}
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}
