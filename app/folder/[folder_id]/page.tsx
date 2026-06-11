import { StorageLayout } from "@/components/StorageLayout"
import { getChildren, getBreadcrumbPath } from "@/server/db/queries"
import type { Node } from "@/lib/types"

interface FolderPageProps {
  params: Promise<{ folder_id: string }>
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folder_id } = await params

  const items = (await getChildren(folder_id, "You")) as unknown as Node[]
  const breadcrumbPath = await getBreadcrumbPath(folder_id, "You")

  return (
    <StorageLayout
      items={items}
      initialFolderId={folder_id}
      breadcrumbPath={[{ id: null, name: "My Files" }, ...breadcrumbPath]}
    />
  )
}
