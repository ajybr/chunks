import { StorageLayout } from "@/components/StorageLayout"
import { getChildren } from "@/server/db/queries"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { Node } from "@/lib/types"

export default async function Home() {
  const session = await auth()
  if (!session.userId) redirect("/")
  const owner = session.userId

  const items = (await getChildren(null, owner)) as unknown as Node[]

  return (
    <StorageLayout
      items={items}
      initialFolderId={null}
      breadcrumbPath={[{ id: null, name: "My Files" }]}
    />
  )
}
