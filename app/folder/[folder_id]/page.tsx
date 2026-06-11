import { StorageLayout } from "@/components/StorageLayout"
import { getChildren, getBreadcrumbPath } from "@/server/db/queries"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { Node } from "@/lib/types"

interface FolderPageProps {
  params: Promise<{ folder_id: string }>
}

export default async function FolderPage({ params }: FolderPageProps) {
  const session = await auth()
  if (!session.userId) redirect("/")
  const owner = session.userId
  const { folder_id } = await params

  const items = (await getChildren(folder_id, owner)) as unknown as Node[]
  const breadcrumbPath = await getBreadcrumbPath(folder_id, owner)

  return (
    <StorageLayout
      items={items}
      initialFolderId={folder_id}
      breadcrumbPath={[{ id: null, name: "My Files" }, ...breadcrumbPath]}
    />
  )
}
