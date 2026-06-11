import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "chunks",
	description: "cloud service",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontMono.variable,
				"font-sans",
				inter.variable,
			)}
		>
			<body className={cn("antialiased", fontMono.variable, inter.variable)}>
				<ClerkProvider>
					<ThemeProvider>
						<SidebarProvider>
							<AppSidebar variant="inset" />
							<SidebarInset> {children}</SidebarInset>
						</SidebarProvider>
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
