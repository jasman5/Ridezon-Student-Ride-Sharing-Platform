"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedButton } from "@/components/ui/animated-button";
import { signupSchema, type SignupFormValues } from "@/schemas/schema";
import googleIcon from "@/../public/google.svg";
import { authApi } from "@/lib/index";

export default function SignupPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState<"initial" | "details">("initial");
	const [googleUserInfo, setGoogleUserInfo] = useState<{
		name?: string;
		email?: string;
		accessToken?: string;
	}>({});

	// Initialize form
	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			email: "",
			gender: undefined,
			phone: "",
		},
	});

	useEffect(() => {
		if (
			step === "details" &&
			(!googleUserInfo.name || !googleUserInfo.email)
		) {
			toast({
				title: "Missing Information",
				description:
					"We couldn't retrieve your name or email from Google. Please try signing in again.",
				variant: "destructive",
			});
			setStep("initial");
		}
	}, [step, googleUserInfo, toast]);

	// Update form values when Google user info changes
	useEffect(() => {
		if (googleUserInfo.name && googleUserInfo.email) {
			form.reset({
				...form.getValues(), // keep phone & gender if already entered
				name: googleUserInfo.name,
				email: googleUserInfo.email,
			});
		}
	}, [googleUserInfo, form]);

	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				setIsLoading(true);

				// Get user info from Google token

				const userInfo = await authApi.getGoogleSignUp(
					tokenResponse.access_token,
				);

				setGoogleUserInfo({
					name: userInfo.name,
					email: userInfo.email,
					accessToken: userInfo.temp_token,
				});

				setIsLoading(false);
				setStep("details");
			} catch (error) {
				console.error("Google auth error:", error);
				setIsLoading(false);
				toast({
					title: "Sign Up Error",
					description:
						error instanceof Error ? error.message : String(error),
					variant: "destructive",
				});
			}
		},
		onError(errorResponse) {
			console.error("Google login error:", errorResponse);
			setIsLoading(false);
			toast({
				title: "Sign Up Error",
				description:
					errorResponse instanceof Error
						? errorResponse.message
						: String(errorResponse),
				variant: "destructive",
			});
		},
	});

	const handleGoogleSignUp = () => {
		setIsLoading(true);
		login();
	};

	const onSubmit = async (data: SignupFormValues) => {
		try {
			setIsLoading(true);

			if (!googleUserInfo.accessToken) {
				throw new Error("Google authentication token is missing");
			}

			// Send the complete user data to the backend
			const response = await authApi.completeSignup({
				access_token: googleUserInfo.accessToken,
				phone_number: data.phone,
				gender: data.gender,
			});

			// Store auth tokens
			sessionStorage.setItem("access", response.access);
			sessionStorage.setItem("refresh", response.refresh);

			setGoogleUserInfo((prev) => ({
				...prev,
				accessToken: response.access,
			}));

			toast({
				title: "Account created",
				description: "Your account has been created successfully.",
			});

			// Redirect to the pools page
			router.push("/pools");
		} catch (error) {
			console.error("Signup error:", error);
			toast({
				title: "Signup Failed",
				description: error instanceof Error ? error.message : String(error),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AnimatedBackground
			variant="paths"
			className="min-h-screen"
		>
			<main className="flex-1 flex items-center justify-center p-4">
				<AnimatePresence mode="wait">
					{step === "initial" ? (
						<motion.div
							key="initial"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5 }}
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
											Create an Account
										</CardTitle>
										<CardDescription>
											Sign up to start sharing rides
										</CardDescription>
									</motion.div>
								</CardHeader>
								<CardContent className="space-y-4">
									<AnimatedButton
										variant="outline"
										className="w-full flex items-center justify-center gap-2 h-12 border-2 border-white/20 dark:border-white/10 hover:bg-white/10 dark:hover:bg-black/20"
										onClick={handleGoogleSignUp}
										disabled={isLoading}
										glowColor="rgba(255, 0, 0, 0.2)"
									>
										{isLoading ? (
											<div className="h-5 w-5 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" />
										) : (
											<div className="flex justify-center items-center gap-2.5">
												<Image
													src={googleIcon ?? "/placeholder.svg"}
													alt="Google Icon"
													width={20}
													height={20}
												/>
												Sign up with Google
											</div>
										)}
									</AnimatedButton>
								</CardContent>
								<CardFooter className="flex flex-col items-center gap-3">
									<p className="text-center text-sm font-semibold">
										Only{" "}
										<span className="text-primary">@ridezon.com</span>{" "}
										email users allowed
									</p>

									<p className="text-sm text-muted-foreground">
										Already have an account?
									</p>

									<Link
										href="/login"
										className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
									>
										<LogIn className="h-4 w-4" />
										Sign in
									</Link>
								</CardFooter>
							</Card>
						</motion.div>
					) : (
						<motion.div
							key="details"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5 }}
							className="w-full max-w-md"
						>
							<Card className="bg-background/60 backdrop-blur-lg border-white/20 dark:border-white/10 shadow-lg">
								<CardHeader className="space-y-1 text-center">
									<CardTitle className="text-2xl font-bold">
										Complete Your Profile
									</CardTitle>
									<CardDescription>
										We need a few more details to set up your account
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{googleUserInfo.name && googleUserInfo.email && (
										<Form {...form}>
											<form
												onSubmit={form.handleSubmit(onSubmit)}
												className="space-y-4"
											>
												<FormField
													control={form.control}
													name="name"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Name</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter your name"
																	{...field}
																	className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
																	disabled
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Email</FormLabel>
															<FormControl>
																<Input
																	type="email"
																	placeholder="Enter your email"
																	{...field}
																	className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
																	disabled
																/>
															</FormControl>
															<FormDescription>
																Email from your Google account
															</FormDescription>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="phone"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-1">
																<Phone className="h-4 w-4" />
																Phone Number
															</FormLabel>
															<FormControl>
																<Input
																	type="tel"
																	placeholder="Enter your phone number"
																	{...field}
																	className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
																/>
															</FormControl>
															<FormDescription>
																We&apos;ll use this to contact
																you about rides
															</FormDescription>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="gender"
													render={({ field }) => (
														<FormItem className="space-y-3">
															<FormLabel>Gender</FormLabel>
															<FormControl>
																<RadioGroup
																	onValueChange={
																		field.onChange
																	}
																	defaultValue={field.value}
																	className="flex flex-col space-y-1"
																>
																	<FormItem className="flex items-center space-x-3 space-y-0">
																		<FormControl>
																			<RadioGroupItem value="Male" />
																		</FormControl>
																		<FormLabel className="font-normal">
																			Male
																		</FormLabel>
																	</FormItem>
																	<FormItem className="flex items-center space-x-3 space-y-0">
																		<FormControl>
																			<RadioGroupItem value="Female" />
																		</FormControl>
																		<FormLabel className="font-normal">
																			Female
																		</FormLabel>
																	</FormItem>
																	<FormItem className="flex items-center space-x-3 space-y-0">
																		<FormControl>
																			<RadioGroupItem value="Others" />
																		</FormControl>
																		<FormLabel className="font-normal">
																			Others
																		</FormLabel>
																	</FormItem>
																</RadioGroup>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<AnimatedButton
													type="submit"
													className="w-full bg-primary hover:bg-primary/90"
													disabled={isLoading}
													glowColor="rgba(255, 0, 0, 0.3)"
												>
													{isLoading ? (
														<div className="h-5 w-5 border-2 border-primary-foreground/50 border-t-transparent rounded-full animate-spin" />
													) : (
														"Complete Sign Up"
													)}
												</AnimatedButton>
											</form>
										</Form>
									)}
								</CardContent>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			<footer className="py-6 text-center text-sm text-muted-foreground">
				<p>© {new Date().getFullYear()} ThaparGo. All rights reserved.</p>
			</footer>
		</AnimatedBackground>
	);
}
