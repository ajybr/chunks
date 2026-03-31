"use client";

import * as React from "react";
import {
	FileStack,
	House,
	Trash2,
	Users,
	FileImage,
	Star,
	Cloudy,
} from "lucide-react";
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
import { Show, SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<a href="/" className="flex gap-3 ">
					<Cloudy className="size-5! " />
					<span className="text-base text-primary font-semibold">Chunks</span>
				</a>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent className="flex flex-col gap-2">
						<SidebarGroupLabel>Menu</SidebarGroupLabel>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem
									className="flex items-center "
									key={item.title}
								>
									<SidebarMenuButton tooltip={item.title}>
										{item.disabled ? (
											<button
												type="button"
												disabled
												className="flex w-full items-center gap-2"
											>
												<item.icon className="h-4 w-4" />
												<span>{item.title}</span>
												{item.badge && (
													<span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
														{item.badge}
													</span>
												)}
											</button>
										) : (
											<Link
												href={item.url}
												className="flex w-full items-center gap-2"
											>
												<item.icon className="h-4 w-4" />
												<span>{item.title}</span>
												{item.badge && (
													<span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
														{item.badge}
													</span>
												)}
											</Link>
										)}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<div className="px-2 py-1 text-xs text-muted-foreground flex justify-center">
					Used 112.0 MB out of 1 GB
				</div>
				<Show when="signed-out">
					<SignInButton />
					<SignUpButton>
						<Button className="bg-muted text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
							{" "}
							Sign Up
						</Button>
					</SignUpButton>
				</Show>
				<Show when="signed-in">
					<UserButton />
				</Show>
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
}
