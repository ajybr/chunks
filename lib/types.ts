export type StorageItem = FileType | FolderType

export type FileType = {
  id: string
  url: string
  name: string
  parent_id: string | null
  size: number
  owner: string
  modified_at: Date
  is_deleted: boolean
  type: "file"
}

export type FolderType = {
  id: string
  item_count: number
  name: string
  parent_id: string | null
  owner: string
  modified_at: Date
  is_deleted: boolean
  type: "folder"
}
