"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, X, Github, LogOut, User } from "lucide-react";
import { authApi } from "@/lib";
import { projectConfig } from "@/lib/config";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

interface NavLink {
	href: string;
	label: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	isExternal?: boolean;
}

export function LandingNavbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const isPoolPage = pathname === "/pools" || pathname?.startsWith("/groups");
	const isAuthPage = pathname === "/login" || pathname === "/signup";

	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setIsAuthenticated(!!sessionStorage.getItem("access"));
	}, []);

	if (isPoolPage) return null;

	const logoSrc = mounted && resolvedTheme === "dark" ? projectConfig.logoDark : projectConfig.logoLight;

	const toggleMenu = () => setIsMenuOpen((prev) => !prev);

	const handleLogout = async () => {
		try {
			await authApi.logout();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const handleSectionNavigate = (hash: string) => {
		if (isAuthPage) {
			router.push(`/#${hash}`);
		} else {
			const el = document.getElementById(hash);
			if (el) {
				gsap.to(window, {
					duration: 1.5,
					scrollTo: { y: el, offsetY: 80 },
					ease: "power2.inOut",
				});
			} else {
				router.push(`/#${hash}`);
			}
		}
	};

	const Logo = () => (
		<Link
			href={isAuthenticated ? "/pools" : "/"}
			className="flex items-center justify-center"
		>
		</Link>
	);

	const navLinks: NavLink[] = [
		{ href: "features", label: "Features" },
		{ href: "about", label: "About" },
		{ href: "faq", label: "FAQ" },
	];

	return (
		<motion.header
			className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="container mx-auto flex justify-between items-center p-4 py-6">
				<Logo />

				{/* Desktop Nav */}
				<div className="hidden md:flex items-center gap-4">
					<nav className="flex items-center gap-6 mr-4">
						{navLinks.map((link) =>
							link.isExternal ? (
								<Link
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 hover:scale-105 transform duration-200"
								>
									{link.icon}
									{link.label}
								</Link>
							) : (
								<button
									key={link.label}
									onClick={() => handleSectionNavigate(link.href)}
									className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 hover:scale-105 transform duration-200"
								>
									{link.icon}
									{link.label}
								</button>
							),
						)}
					</nav>

					<ThemeToggle />

					{isAuthenticated ? (
						<Button
							variant="ghost"
							className="flex items-center gap-2 hover:scale-105 transform transition-all duration-200 text-muted-foreground hover:text-foreground"
							onClick={handleLogout}
						>
							<LogOut className="h-4 w-4" />
							<span>Log out</span>
						</Button>
					) : (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								onClick={() => router.push("/login")}
								className="hover:bg-accent hover:text-accent-foreground hover:scale-105 transform transition-all duration-200"
							>
								Login
							</Button>
							<Button
								variant="default"
								className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transform transition-all duration-200 shadow-md shadow-primary/20"
								onClick={() => router.push("/signup")}
							>
								Sign Up
							</Button>
						</div>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden flex items-center gap-2">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleMenu}
						className="relative hover:bg-accent"
					>
						<AnimatePresence mode="wait">
							{isMenuOpen ? (
								<motion.div
									key="close"
									initial={{ opacity: 0, rotate: -90 }}
									animate={{ opacity: 1, rotate: 0 }}
									exit={{ opacity: 0, rotate: 90 }}
									transition={{ duration: 0.2 }}
								>
									<X className="h-6 w-6" />
								</motion.div>
							) : (
								<motion.div
									key="menu"
									initial={{ opacity: 0, rotate: 90 }}
									animate={{ opacity: 1, rotate: 0 }}
									exit={{ opacity: 0, rotate: -90 }}
									transition={{ duration: 0.2 }}
								>
									<Menu className="h-6 w-6" />
								</motion.div>
							)}
						</AnimatePresence>
					</Button>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="md:hidden backdrop-blur-md border-b border-border bg-background/95"
					>
						<div className="container mx-auto p-4 flex flex-col gap-3">
							{navLinks.map((link) =>
								link.isExternal ? (
									<Link
										key={link.label}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 hover:bg-accent rounded-md transition-colors flex items-center gap-2 text-foreground"
										onClick={toggleMenu}
									>
										{link.icon}
										{link.label}
									</Link>
								) : (
									<button
										key={link.label}
										onClick={() => {
											handleSectionNavigate(link.href);
											toggleMenu();
										}}
										className="p-2 hover:bg-accent rounded-md transition-colors flex items-center gap-2 text-left text-foreground"
									>
										{link.icon}
										{link.label}
									</button>
								),
							)}

							<div className="border-t border-border my-2 pt-2" />

							{isAuthenticated ? (
								<>
									<Button
										variant="outline"
										className="flex items-center gap-2 justify-start border-input bg-transparent text-foreground hover:bg-accent"
									>
										<User className="h-4 w-4" />
										<span>Profile</span>
									</Button>
									<Button
										variant="outline"
										className="flex items-center gap-2 justify-start text-destructive border-input bg-transparent hover:bg-destructive/10"
										onClick={() => {
											toggleMenu();
											handleLogout();
										}}
									>
										<LogOut className="h-4 w-4" />
										<span>Log out</span>
									</Button>
								</>
							) : (
								<>
									<Button
										variant="outline"
										className="w-full bg-transparent border-input hover:bg-accent text-foreground"
										onClick={() => {
											toggleMenu();
											router.push("/login");
										}}
									>
										Login
									</Button>
									<Button
										variant="default"
										className="bg-primary hover:bg-primary/90 text-primary-foreground w-full shadow-md"
										onClick={() => {
											toggleMenu();
											router.push("/signup");
										}}
									>
										Sign Up
									</Button>
								</>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
