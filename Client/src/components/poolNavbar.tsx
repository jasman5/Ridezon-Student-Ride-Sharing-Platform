"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, PlusCircle } from "lucide-react";
import { authApi } from "@/lib";

interface NavbarProps {
	onCreatePool?: () => void;
}

// Define the type for navigation links
interface NavLink {
	href: string;
	label: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	isExternal?: boolean;
	hideOnMobile?: boolean;
}

export function PoolNavbar({ onCreatePool }: Readonly<NavbarProps>) {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);


	useEffect(() => {
		// Check if user is authenticated
		const accessToken = sessionStorage.getItem("access");
		setIsAuthenticated(!!accessToken);
	}, []);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const handleLogout = async () => {
		try {
			// Clear local storage
			await authApi.logout();

			// Redirect to login page
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	// Logo component with theme awareness and improved visibility
	const Logo = () => {
		return (
			<Link
				href={isAuthenticated ? "/pools" : "/"}
				className="flex items-center justify-center"
			>
			</Link>
		);
	};

	// App navigation links (when authenticated)
	const navLinks: NavLink[] = [
		{ href: "/pools", label: "Rides", icon: <Home size={16} /> },
		{
			href: "#",
			label: "Create Pool",
			icon: <PlusCircle size={16} />,
			onClick: onCreatePool,
			// Hide on mobile since it's now in the dashboard
			hideOnMobile: true,
		},
	];

	// Determine which links to show based on current page and auth status

	return (
		<motion.header
			className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="container mx-auto flex justify-between items-center p-4 py-0">
				<Logo />

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-4">
					<nav className="flex items-center gap-6 mr-4">
						{navLinks.map((link) => {
							if (link.isExternal) {
								return (
									<Link
										key={link.label}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
									>
										{link.icon}
										{link.label}
									</Link>
								);
							} else if (link.onClick) {
								return (
									<Button
										key={link.label}
										variant="ghost"
										onClick={link.onClick}
										className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
									>
										{link.icon}
										{link.label}
									</Button>
								);
							} else {
								return (
									<Link
										key={link.label}
										href={link.href}
										className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
									>
										{link.icon}
										{link.label}
									</Link>
								);
							}
						})}
					</nav>

					<ThemeToggle />

					{isAuthenticated ? (
						<Button
							variant="ghost"
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
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
								className="hover:bg-accent hover:text-accent-foreground"
							>
								Login
							</Button>
							<Button
								variant="default"
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
							{navLinks
								.filter((link) => !link.hideOnMobile)
								.map((link) => {
									if (link.isExternal) {
										return (
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
										);
									} else if (link.onClick) {
										return (
											<Button
												key={link.label}
												variant="ghost"
												onClick={() => {
													link.onClick?.();
													toggleMenu();
												}}
												className="justify-start p-2 hover:bg-accent rounded-md transition-colors flex items-center gap-2 text-foreground w-full"
											>
												{link.icon}
												{link.label}
											</Button>
										);
									} else {
										return (
											<Link
												key={link.label}
												href={link.href}
												className="p-2 hover:bg-accent rounded-md transition-colors flex items-center gap-2 text-foreground"
												onClick={toggleMenu}
											>
												{link.icon}
												{link.label}
											</Link>
										);
									}
								})}

							{isAuthenticated ? (
								<>
									<div className="border-t border-border my-1 pt-1"></div>
									<Button
										variant="outline"
										className="flex items-center gap-2 justify-start text-destructive border-input bg-transparent hover:bg-destructive/10 w-full"
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
									<div className="border-t border-border my-2 pt-2"></div>
									<Button
										variant="outline"
										className="w-full border-input bg-transparent hover:bg-accent text-foreground"
										onClick={() => {
											toggleMenu();
											router.push("/login");
										}}
									>
										Login
									</Button>
									<Button
										variant="default"
										className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
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
