import { Inter, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

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
						{children}
						<Toaster position="bottom-right" />
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
