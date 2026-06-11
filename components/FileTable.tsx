"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  File,
  Folder,
  Ellipsis,
  Download,
  Share2,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import type { Node } from "@/lib/types";

interface FileTableProps {
  items: Node[];
  onFolderClick?: (folderId: string) => void;
}

export function FileTable({ items, onFolderClick }: FileTableProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    const sizeInMB = sizeInKB / 1024;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    const sizeInGB = sizeInMB / 1024;
    return `${sizeInGB.toFixed(1)} GB`;
  };

  const handleMenuAction = async (action: string, item: Node) => {
    setOpenMenuId(null);

    switch (action) {
      case "download": {
        window.open(`/api/nodes/${item.id}/download`, "_blank");
        break;
      }
      case "rename": {
        const name = prompt("Rename:", item.name);
        if (name && name !== item.name) {
          const res = await fetch(`/api/nodes/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });
          if (res.ok) router.refresh();
        }
        break;
      }
      case "delete": {
        if (confirm(`Move "${item.name}" to trash?`)) {
          await fetch(`/api/nodes/${item.id}/delete`, { method: "POST" });
          router.refresh();
        }
        break;
      }
      default:
        console.log(`[v0] Action "${action}" triggered for item: ${item.id}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Folder className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No files or folders</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop files here or click the upload button to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-32">Size</TableHead>
            <TableHead className="w-40">Last Modified</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger>
                <TableRow
                  onClick={() => {
                    if (item.type === "folder") {
                      onFolderClick?.(item.id);
                    } else if (item.url) {
                      window.open(item.url, "_blank");
                    }
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell className="py-4 flex gap-3 align-middle font-medium">
                    {item.type === "folder" ? (
                      <Folder className="h-5 w-5 text-amber-500" />
                    ) : (
                      <File className="h-5 w-5 text-blue-500" />
                    )}
                    {item.name}
                  </TableCell>
                  <TableCell className="py-4 align-middle text-sm text-muted-foreground">
                    {item.owner}
                  </TableCell>
                  <TableCell className="py-4 align-middle text-sm text-muted-foreground">
                    {item.type === "folder"
                      ? "\u2014"
                      : formatFileSize(item.size ?? 0)}
                  </TableCell>
                  <TableCell className="py-4 align-middle text-sm text-muted-foreground">
                    {formatDate(item.modified_at)}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Ellipsis className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() =>
                              handleMenuAction("download", item)
                            }
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMenuAction("share", item)}
                            className="gap-2"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMenuAction("star", item)}
                            className="gap-2"
                          >
                            <Star className="h-4 w-4" />
                            Star
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMenuAction("rename", item)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleMenuAction("delete", item)}
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
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem
                  onClick={() => handleMenuAction("download", item)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleMenuAction("share", item)}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleMenuAction("rename", item)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Rename
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => handleMenuAction("delete", item)}
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
  );
}
