export type Node = {
  id: string
  parent_id: string | null
  owner: string
  name: string
  type: "file" | "folder"
  modified_at: Date
  is_deleted: boolean
  url?: string
  size?: number | string
}

export type BreadcrumbItem = { id: string | null; name: string }

export type FileMetadata = {
  node_id: string
  url: string
  size: number
  mime_type: string
}

export type FolderMetadata = {
  node_id: string
  item_count: number
}

export type StorageItem = (Node & FileMetadata) | (Node & FolderMetadata)
