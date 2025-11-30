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
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						<Image
							src={logoSrc}
							alt="Ridezon Logo"
							width={160}
							height={160}
							priority
						/>
					</div>

					<div className="flex flex-col md:flex-row items-center gap-4">

						<div className="flex items-center gap-2">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link
									href={projectConfig.projectSrc}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-accent border border-border transition-colors"
								>
									<Github size={16} className="text-foreground" />
									<span className="text-sm font-medium text-foreground">GitHub</span>
								</Link>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link
									href="/privacypolicy"
									className="flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-accent border border-border transition-colors"
								>
									<Shield size={16} className="text-foreground" />
									<span className="text-sm font-medium text-foreground">
										Privacy Policy
									</span>
								</Link>
							</motion.div>
						</div>
					</div>
				</div>

				<div className="mt-6 text-center">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Ridezon. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
