import { StorageLayout } from "@/components/StorageLayout"
import { getChildren } from "@/server/db/queries"
import type { Node } from "@/lib/types"

export default async function Home() {
  const items = (await getChildren(null, "System")) as unknown as Node[]

  return (
    <StorageLayout
      items={items}
      initialFolderId={null}
      breadcrumbPath={[{ id: null, name: "My Files" }]}
    />
  )
}
