"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, File, Folder, Ellipsis } from "lucide-react"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/SearchBar"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import type { Node } from "@/lib/types"

export default function FavoritesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Node[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useUser()

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("/api/favorites")
        if (res.ok) {
          const data = await res.json()
          setItems(data.items ?? [])
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err)
      }
    }
    fetchFavorites()
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isEmptyState = filteredItems.length === 0 && searchQuery === ""

  const handleUnstar = async (e: React.MouseEvent, item: Node) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/nodes/${item.id}/star`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to unstar")
      toast.success("Removed from favorites", { position: "bottom-right" })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unstar item", { position: "bottom-right" })
    }
  }

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
            <Star className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No favorites yet</h3>
            <p className="text-sm text-muted-foreground">
              Star files and folders to see them here
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
                  <TableHead className="w-40">Favorited</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
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
                      {formatDate(item.favorited_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                            <Ellipsis className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => handleUnstar(e, item)}
                            className="gap-2"
                          >
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            Remove from favorites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
