import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import { LandingNavbar } from "@/components/landingNavbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Ridezon - Student Ride Sharing",
	description: "Ridezon is a ride sharing platform for students.",
	manifest: "/manifest.json",
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
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<GoogleOAuthProvider
					clientId={String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem
						disableTransitionOnChange
					>
						<div className="flex flex-col min-h-screen">
							<LandingNavbar />
							<main className="flex-1">{children}</main>
							<Footer />
						</div>
						<Toaster />
					</ThemeProvider>
				</GoogleOAuthProvider>
			</body>
		</html>
	);
}
