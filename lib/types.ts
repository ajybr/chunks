export type Node = {
  id: string
  parent_id: string | null
  owner: string
  name: string
  type: "file" | "folder"
  modified_at: Date
  is_deleted: boolean
  // File-specific fields
  url?: string
  size?: number
  mime_type?: string
  // Folder-specific fields
  item_count?: number
}

export type FileMetaData = {
  node_id: string
  url: string
  size: number
  mime_type: string
}

export type FolderMetaData = {
  node_id: string
  item_count: number
}
