import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { StorageLayout } from "@/components/StorageLayout"
import { db } from "@/server/db"
import { node, fileMetadata, folderMetadata } from "@/server/db/schema"

async function getItems() {
  const allItems = await db.select().from(node)
  const allFileMetadata = await db.select().from(fileMetadata)
  const allFolderMetadata = await db.select().from(folderMetadata)

  const fileMetaMap: Record<
    string,
    { url: string; size: number; mime_type: string }
  > = {}
  const folderMetaMap: Record<string, { item_count: number }> = {}

  for (const m of allFileMetadata) {
    fileMetaMap[m.node_id as string] = m as any
  }
  for (const m of allFolderMetadata) {
    folderMetaMap[m.node_id as string] = m as any
  }

  return allItems.map((item) => {
    const itemId = String(item.id)
    if (item.type === "file") {
      const meta = fileMetaMap[itemId]
      return {
        ...item,
        url: meta?.url ?? "",
        size: meta?.size ?? 0,
        mime_type: meta?.mime_type ?? "",
      }
    } else {
      const meta = folderMetaMap[itemId]
      return {
        ...item,
        item_count: meta?.item_count ?? 0,
      }
    }
  })
}

export default async function Home() {
  const items = await getItems()

  return (
    <SidebarProvider>
      <AppSidebar />
      <StorageLayout items={items as any} />
    </SidebarProvider>
  )
}
