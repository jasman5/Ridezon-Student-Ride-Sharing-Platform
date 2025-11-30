"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { projectConfig } from "@/lib/config";

export function Footer() {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const logoSrc = mounted && resolvedTheme === "dark" ? projectConfig.logoDark : projectConfig.logoLight;

	return (
		<footer className="bg-muted/30 backdrop-blur-sm border-t border-border py-3">
			<div className="container mx-auto px-4">
				<div className="mt-6 text-center">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Ridezon. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
