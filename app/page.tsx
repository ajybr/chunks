import { StorageLayout } from "@/components/StorageLayout"
import { getChildren } from "@/server/db/queries"

export default async function Home() {
  const items = await getChildren(null, "System")

  return (
      <StorageLayout
        items={items as any}
        initialFolderId={null}
        breadcrumbPath={[{ id: null, name: "My Files" }]}
      />
  )
}
