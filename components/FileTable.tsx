'use client'

import { useState } from 'react'
import { File, Folder, Ellipsis, Download, Share2, Edit, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { StorageItem } from '@/lib/types'

interface FileTableProps {
  items: StorageItem[]
}

export function FileTable({ items }: FileTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const handleMenuAction = (action: string, itemId: string) => {
    console.log(`[v0] Action "${action}" triggered for item: ${itemId}`)
    setOpenMenuId(null)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Folder className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No files or folders</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop files here or click the upload button to get started
        </p>
      </div>
    )
  }

  return (
    <div className=" rounded-lg ">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead className="w-32">File Size</TableHead>
            <TableHead className="w-40">Date Modified</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ContextMenu key={item.id}>
            {/*
              Add a context menu trigger -right click anywhere on a table column invokes the context menu
              */}
                <TableRow
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    {item.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-amber-500" />
                    ) : (
                      <File className="h-5 w-5 text-blue-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.uploadedBy}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.fileSize}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.dateModified)}
                  </TableCell>
                  <TableCell>
                    {hoveredId === item.id && (
                      <DropdownMenu open={openMenuId === item.id} onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-fit w-fit"
                          >
                            <Ellipsis className="h-fit w-fit" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleMenuAction('download', item.id)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMenuAction('share', item.id)}
                            className="gap-2"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMenuAction('rename', item.id)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleMenuAction('delete', item.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              <ContextMenuContent className="w-48">
                <ContextMenuItem
                  onClick={() => handleMenuAction('download', item.id)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleMenuAction('share', item.id)}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleMenuAction('rename', item.id)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Rename
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => handleMenuAction('delete', item.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

