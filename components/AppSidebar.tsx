"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { House, Trash2, Users, FileImage, Star, Cloudy } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Star,
    badge: "coming soon",
    disabled: true,
  },
  {
    title: "Shared",
    url: "/shared",
    icon: Users,
    badge: "coming soon",
    disabled: true,
  },
  {
    title: "Images",
    url: "/images",
    icon: FileImage,
  },
  {
    title: "Trash",
    url: "/trash",
    icon: Trash2,
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = useUser();
  const [storage, setStorage] = useState<{
    used: number;
    quota: number;
  } | null>(null);

  useEffect(() => {
    if (userData.isSignedIn) {
      fetch("/api/storage")
        .then((r) => r.json())
        .then((data) => setStorage(data))
        .catch(() => {});
    }
  }, [userData.isSignedIn]);

  const storagePercent = storage
    ? Math.min(Math.round((storage.used / storage.quota) * 100), 100)
    : 0;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/" className="flex gap-3 group-data-[collapsible=icon]:justify-center">
          <Cloudy className="size-5!" />
          <span className="group-data-[collapsible=icon]:hidden text-base font-semibold text-primary">Chunks</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem className="flex items-center" key={item.title}>
                  {item.disabled ? (
                    <SidebarMenuButton tooltip={item.title} disabled className="opacity-50 cursor-not-allowed">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton tooltip={item.title} render={<Link href={item.url} />}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-1 px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span>
            {storage ? `${formatBytes(storage.used)} used` : "\u00A0"}
          </span>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
        {!userData.isSignedIn ? (
          <>
            <SignInButton />
            <SignUpButton>
              <Button className="h-10 cursor-pointer rounded-full bg-muted px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
                {" "}
                Sign Up
              </Button>
            </SignUpButton>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted/50 group-data-[collapsible=icon]:p-0"
              >
                <Image
                  src={userData.user?.imageUrl ?? ""}
                  height={36}
                  width={36}
                  alt="User avatar"
                  className="rounded-xl object-cover group-data-[collapsible=icon]:hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {userData.isLoaded && userData.user
                      ? userData.user.fullName
                      : ""}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userData.isLoaded && userData.user
                      ? userData.user.primaryEmailAddress?.emailAddress
                      : ""}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
            ></DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
