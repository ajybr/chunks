import { StorageLayout } from "@/components/StorageLayout"
import { getChildren, getBreadcrumbPath } from "@/server/db/queries"

interface FolderPageProps {
  params: Promise<{ folder_id: string }>
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folder_id } = await params

  const items = await getChildren(folder_id, "You")
  const breadcrumbPath = await getBreadcrumbPath(folder_id, "You")

  return (
    <StorageLayout
      items={items as any}
      initialFolderId={folder_id}
      breadcrumbPath={[{ id: null, name: "My Files" }, ...breadcrumbPath]}
    />
  )
}
