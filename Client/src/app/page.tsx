"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Car, Users, Venus, MapPin, IndianRupee } from "lucide-react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const features = [
	{
		icon: <Car className="h-10 w-10 text-primary" />,
		title: "Create Pools",
		description:
			"Easily create ride pools for your trips to and from campus, home, or anywhere else.",
	},
	{
		icon: <Users className="h-10 w-10 text-primary" />,
		title: "Find Companions",
		description:
			"Connect with fellow students who are traveling in the same direction.",
	},
	{
		icon: <IndianRupee className="h-10 w-10 text-primary" />,
		title: "Save Money",
		description:
			"Split transportation costs and save money on your regular commutes.",
	},
	{
		icon: <Venus className="h-10 w-10 text-primary" />,
		title: "Female-Only Pools",
		description:
			"Safe and comfortable ride-sharing options exclusively for women.",
	},
];

export default function LandingPage() {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { scrollYProgress } = useScroll();
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

	useEffect(() => {
		// Check if user is authenticated
		const accessToken = sessionStorage.getItem("access");
		setIsAuthenticated(!!accessToken);
	}, []);

	useEffect(() => {
		// Enable smooth scrolling for the entire page
		gsap.set("html", { scrollBehavior: "auto" });

		// Add smooth scroll to body
		gsap.to("body", {
			duration: 0,
			ease: "none",
		});
	}, []);

	const handleGetStarted = () => {
		if (isAuthenticated) {
			router.push("/pools");
		} else {
			router.push("/login");
		}
	};

	const smoothScrollTo = (elementId: string) => {
		const element = document.getElementById(elementId);
		if (element) {
			gsap.to(window, {
				duration: 0.2,
				scrollTo: { y: element, offsetY: 80 },
				ease: "power2.inOut",
			});
		}
	};

	return (
		<AnimatedBackground
			variant="paths"
			intensity="subtle"
			className="min-h-screen"
		>
			<main>
				{/* Hero Section */}
				<section className="relative py-20 md:py-32 overflow-hidden">
					<motion.div
						className="absolute inset-0 pointer-events-none"
						style={{ opacity }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
					>
						<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
					</motion.div>

					<div className="container mx-auto px-4 relative z-10">
						<div className="flex flex-col items-center text-center max-w-4xl mx-auto">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className="mb-6"
							>
								<h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
									Let&apos;s Go <br />
									<motion.span
										className="text-primary"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.5, duration: 0.5 }}
									>
										With Ridezon!
									</motion.span>
								</h1>
								<span className="px-6 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary inline-block mb-6 border border-primary/20">
									Share your ride, Save your money
								</span>
								<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
									Connect with fellow students for convenient and
									cost-effective transportation to and from campus,
									home, or anywhere else.
								</p>
							</motion.div>

							<motion.div
								className="flex flex-col sm:flex-row gap-4 mt-8"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3, duration: 0.5 }}
							>
								<AnimatedButton
									className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/25"
									onClick={handleGetStarted}
									glowColor="rgba(220, 38, 38, 0.5)"
								>
									Get Started
								</AnimatedButton>
								<Button
									variant="outline"
									size="lg"
									className="bg-background hover:bg-accent text-foreground px-8 py-6 text-lg border-input"
									onClick={() => smoothScrollTo("about")}
								>
									Learn More
								</Button>
							</motion.div>

							{/* <motion.div
								className="mt-16 relative w-full max-w-4xl"
								initial={{ opacity: 0, y: 40 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6, duration: 0.8 }}
							>
								<div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl">
									<div className="absolute inset-0" />
									<Image
										src="/placeholder.svg"
										alt="Thapar University ThaparGo Dashboard"
										width={1280}
										height={720}
										className="w-full h-full object-cover"
									/>
									</div>
							</motion.div> */}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					id="features"
					className="py-20 bg-muted/30"
				>
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<motion.h2
								className="text-3xl md:text-4xl font-bold mb-4"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5 }}
							>
								Why Choose{" "}
								<span className="text-primary">Ridezon</span>?
							</motion.h2>
							<motion.p
								className="text-lg text-muted-foreground max-w-2xl mx-auto"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								Our platform makes it easy for students to coordinate rides and save money on
								transportation.
							</motion.p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{features.map((feature, index) => (
								<motion.div
									key={index}
									className="bg-card hover:bg-accent/50 rounded-xl p-6 border border-border shadow-sm transition-colors"
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.1 * index }}
									whileHover={{
										y: -5,
										boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
									}}
								>
									<div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
										{feature.icon}
									</div>
									<h3 className="text-xl font-semibold mb-2 text-foreground">
										{feature.title}
									</h3>
									<p className="text-muted-foreground">
										{feature.description}
									</p>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* About Section */}
				<section
					id="about"
					className="py-20"
				>
					<div className="container mx-auto px-4">
						<div className="flex flex-col lg:flex-row items-center gap-12">
							<motion.div
								className="flex-1"
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								<h2 className="text-3xl md:text-4xl font-bold mb-6">
									About <span className="text-primary">Ridezon</span>
								</h2>
								<p className="text-lg mb-6 text-muted-foreground leading-relaxed">
									Ridezon is a student-led initiative designed to
									solve transportation challenges faced by students. Our platform connects students who
									are traveling in the same direction, allowing them to
									share rides and split costs.
								</p>
								<p className="text-lg mb-6 text-muted-foreground leading-relaxed">
									Whether you&apos;re commuting to campus daily,
									heading home for the weekend, or planning a trip to
									the city, our platform makes it easy to find travel
									companions and save money.
								</p>
								<div className="space-y-4">
									{[
										{
											icon: <MapPin size={20} />,
											text: "Connect with students traveling the same route",
										},
										{
											icon: <Users size={20} />,
											text: "Female-only pools for enhanced safety and comfort",
										},
										{
											icon: (
												<span className="text-primary text-xl font-bold">
													₹
												</span>
											),
											text: "Transparent fare sharing system",
										},
									].map((item, index) => (
										<div
											key={index}
											className="flex items-center gap-3 text-foreground"
										>
											<div className="text-primary bg-primary/10 p-2 rounded-full">{item.icon}</div>
											<span>{item.text}</span>
										</div>
									))}
								</div>
							</motion.div>

							<motion.div
								className="flex-1"
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								<div className="relative rounded-xl overflow-hidden border border-border bg-gradient-to-bl from-primary/5 to-background aspect-[4/3] flex items-center justify-center shadow-lg">
									<Users className="w-20 h-20 text-primary/60" />
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section
					id="faq"
					className="py-20 bg-muted/30"
				>
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<motion.h2
								className="text-3xl md:text-4xl font-bold mb-4"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5 }}
							>
								Frequently Asked Questions
							</motion.h2>
							<motion.p
								className="text-lg text-muted-foreground max-w-2xl mx-auto"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								Get answers to common questions about using the Ridezon
								platform.
							</motion.p>
						</div>

						<div className="max-w-3xl mx-auto space-y-6">
							{[
								{
									question: "How do I create a carpool?",
									answer:
										"After signing up, navigate to the dashboard and click on 'Create Pool'. Fill in details like start point, end point, date, time, and number of seats available.",
								},
								{
									question: "Is there a fee to use the platform?",
									answer:
										"No, the platform is completely free for all students. You only pay for your share of the transportation costs as agreed with your carpool group.",
								},
								{
									question:
										"How does the female-only pool option work?",
									answer:
										"When creating a pool, you can select the 'Female Only' option. This ensures that only female students can join your pool, providing an additional layer of comfort and safety.",
								},
								{
									question: "Can I cancel my participation in a pool?",
									answer:
										"Yes, you can cancel your participation up to a certain time before the scheduled departure. Please be considerate and cancel as early as possible to allow others to make alternative arrangements.",
								},
							].map((faq, index) => (
								<motion.div
									key={index}
									className="bg-card rounded-xl p-6 border border-border shadow-sm"
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.1 * index }}
								>
									<h3 className="text-xl font-semibold mb-2 text-foreground">
										{faq.question}
									</h3>
									<p className="text-muted-foreground">{faq.answer}</p>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<motion.div
							className="bg-primary/5 backdrop-blur-md rounded-xl p-12 border border-primary/10 text-center"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
								Ready to Start Carpooling?
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
								Join the Ridezon community today and start saving on
								your transportation costs while making new connections.
							</p>
							<div className="inline-block">
								<AnimatedButton
									className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/25"
									onClick={handleGetStarted}
									glowColor="rgba(220, 38, 38, 0.5)"
								>
									Get Started Now
								</AnimatedButton>
							</div>
						</motion.div>
					</div>
				</section>
			</main>
		</AnimatedBackground>
	);
}
