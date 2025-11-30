"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full bg-card/50 backdrop-blur-md hover:bg-accent border border-border"
		>
			<motion.div
				initial={{ scale: 0.8, rotate: 0 }}
				animate={{ scale: 1, rotate: theme === "dark" ? 180 : 0 }}
				transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
				className="relative h-6 w-6"
			>
				<Sun className="absolute h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			</motion.div>
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
