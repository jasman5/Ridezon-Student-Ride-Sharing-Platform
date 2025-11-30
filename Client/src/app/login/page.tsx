"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedButton } from "@/components/ui/animated-button";
import googleIcon from "@/../public/google.svg";
import { authApi } from "@/lib/index";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	// Check for error in URL
	const error = searchParams.get("error");

	useEffect(() => {
		// Show error toast if there's an error
		if (error) {
			toast({
				title: "Authentication Error",
				description: "There was a problem signing in with Google.",
				variant: "destructive",
			});
		}
	}, [error, toast]);

	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				setIsLoading(true);

				// Call the backend API with the Google token
				const response = await authApi.googleLogin(
					tokenResponse.access_token,
				);

				// Store auth tokens in sessionStorage
				sessionStorage.setItem("access", response.access);
				sessionStorage.setItem("refresh", response.refresh);

				// Redirect to the pools page
				router.push("/pools");
			} catch (error) {
				console.error("Login error:", error);
				toast({
					title: "Login Failed",
					description:
						error instanceof Error ? error.message : String(error),
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		},
		onError(errorResponse) {
			console.error("Google login error:", errorResponse);
			setIsLoading(false);
			toast({
				title: "Log in In Error",
				description:
					errorResponse instanceof Error
						? errorResponse.message
						: String(errorResponse),
				variant: "destructive",
			});
		},
	});

	const handleGoogleLogin = () => {
		setIsLoading(true);
		login();
	};

	return (
		<AnimatedBackground
			variant="paths"
			className="min-h-screen"
		>
			<main className="flex-1 flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="w-full max-w-md"
				>
					<Card className="bg-background/60 backdrop-blur-lg border-white/20 dark:border-white/10 shadow-lg">
						<CardHeader className="space-y-1 text-center">
							<motion.div
								initial={{ scale: 0.9 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<CardTitle className="text-2xl font-bold">
									Welcome Back
								</CardTitle>
								<CardDescription>
									Sign in to your account to continue
								</CardDescription>
							</motion.div>
						</CardHeader>
						<CardContent className="space-y-4">
							<AnimatedButton
								variant="outline"
								className="w-full flex items-center justify-center gap-2 h-12 border-2 border-white/20 dark:border-white/10 hover:bg-white/10 dark:hover:bg-black/20"
								onClick={handleGoogleLogin}
								disabled={isLoading}
								glowColor="rgba(255, 0, 0, 0.2)"
							>
								{isLoading ? (
									<div className="h-5 w-5 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" />
								) : (
									<div className="flex justify-center items-center gap-2.5">
										<Image
											src={googleIcon || "/placeholder.svg"}
											alt="Google Icon"
											width={20}
											height={20}
										/>
										Sign in with Google
									</div>
								)}
							</AnimatedButton>
						</CardContent>
						<CardFooter className="flex flex-col items-center justify-center gap-2">
							<p className="text-sm text-muted-foreground">
								Don&apos;t have an account?
							</p>
							<Link
								href="/signup"
								className="flex items-center gap-1 text-sm text-primary hover:underline"
							>
								<LogIn className="h-4 w-4" />
								Sign up now
							</Link>
						</CardFooter>
					</Card>
				</motion.div>
			</main>

			<footer className="py-6 text-center text-sm text-muted-foreground">
				<p>© {new Date().getFullYear()} Ridezon. All rights reserved.</p>
			</footer>
		</AnimatedBackground>
	);
}
