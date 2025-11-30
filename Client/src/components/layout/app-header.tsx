"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Car, Menu, X, LogOut } from "lucide-react";
import { authApi } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";

interface AppHeaderProps {
	readonly onCreatePool: () => void;
}

export function AppHeader({ onCreatePool }: AppHeaderProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const handleLogout = async () => {
		try {
			await authApi.logout();
			toast({
				title: "Logged out",
				description: "You have been successfully logged out.",
			});
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<motion.header
			className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 dark:border-white/5"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="container mx-auto flex justify-between items-center p-4">
				<Link
					href="/"
					className="flex items-center gap-2"
				>
					<motion.div
						initial={{ rotate: -10 }}
						animate={{ rotate: 10 }}
						transition={{
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
							duration: 1.5,
						}}
					>
						<Car className="h-6 w-6 text-primary" />
					</motion.div>
					<motion.span
						className="text-2xl font-bold text-primary"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
					>
						Ridezon
					</motion.span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-4">
					<ThemeToggle />
					<AnimatedButton
						variant="default"
						className="bg-primary hover:bg-primary/90"
						onClick={onCreatePool}
						glowColor="rgba(255, 0, 0, 0.3)"
					>
						Create Pool
					</AnimatedButton>

					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={handleLogout}
					>
						<LogOut className="h-4 w-4" />
						<span>Log out</span>
					</Button>
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden flex items-center gap-2">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleMenu}
						className="relative"
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
						className="md:hidden backdrop-blur-md border-b border-white/10 dark:border-white/5"
					>
						<div className="container mx-auto p-4 flex flex-col gap-3">
							<AnimatedButton
								variant="default"
								className="bg-primary hover:bg-primary/90 w-full"
								onClick={() => {
									onCreatePool();
									setIsMenuOpen(false);
								}}
								glowColor="rgba(255, 0, 0, 0.3)"
							>
								Create Pool
							</AnimatedButton>

							<Button
								variant="outline"
								className="flex items-center gap-2 justify-start text-destructive border-white/20 dark:border-white/10"
								onClick={handleLogout}
							>
								<LogOut className="h-4 w-4" />
								<span>Log out</span>
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
