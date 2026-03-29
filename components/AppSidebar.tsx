"use client"

import * as React from "react"
import { FileStack, House, Trash2, Users, FileImage } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Trash",
    url: "/trash",
    icon: Trash2,
  },
  {
    title: "Shared",
    url: "/shared",
    icon: Users,
    badge: "coming soon",
  },
  {
    title: "Images",
    url: "/images",
    icon: FileImage,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#E9D5FF] to-[#A855F7]">
            <FileStack className="h-4 w-4 text-purple-700" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                <Link href={item.url} className="flex w-full items-center">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Used 2.0 MB out of 1 GB
        </div>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#E9D5FF] to-[#A855F7]" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">User</span>
            <span className="text-xs text-muted-foreground">
              user@example.com
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
