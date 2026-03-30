import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { StorageLayout } from "@/components/StorageLayout"
import { getChildren } from "@/server/db/queries"

export default async function Home() {
  const items = await getChildren(null, "System")
  console.log(items)

  return (
    <SidebarProvider>
      <AppSidebar />
      <StorageLayout
        items={items as any}
        initialFolderId={null}
        breadcrumbPath={[{ id: null, name: "My Files" }]}
      />
    </SidebarProvider>
  )
}
