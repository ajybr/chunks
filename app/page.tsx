'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { StorageLayout } from '@/components/StorageLayout'
import { dummyStorageItems } from '@/lib/dummy-data'

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <StorageLayout items={dummyStorageItems} />
    </SidebarProvider>
  )
}

