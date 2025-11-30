"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { projectConfig } from "@/lib/config";
import { Shield, Mail, MapPin, Calendar, Camera, IdCard } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function PrivacyPolicy() {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted && theme === "dark";

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-white text-gray-900"
				}`}
		>
			{/* Main Content */}
			<main className="container mx-auto px-4 py-12 max-w-4xl">
				{/* Hero Section */}
				<div className="text-center mb-12">
					<div className="flex items-center justify-center mb-4">
						<Shield
							className={`h-12 w-12 ${isDark ? "text-red-400" : "text-red-600"
								}`}
						/>
					</div>
					<h1
						className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"
							}`}
					>
						Privacy{" "}
						<span className={isDark ? "text-red-400" : "text-red-600"}>
							Policy
						</span>
					</h1>
					<p
						className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-300" : "text-gray-600"
							}`}
					>
						Your privacy matters to us. Learn how we collect, use, and
						protect your personal information.
					</p>
				</div>

				{/* Effective Date */}
				<Card
					className={`mb-8 transition-colors duration-300 ${isDark
						? "border-red-800 bg-red-950/20"
						: "border-red-100 bg-red-50/50"
						}`}
				>
					<CardContent className="p-6">
						<div className="flex items-center space-x-3">
							<Calendar
								className={`h-5 w-5 ${isDark ? "text-red-400" : "text-red-600"
									}`}
							/>
							<div>
								<p
									className={`font-semibold ${isDark ? "text-white" : "text-gray-900"
										}`}
								>
									Effective Date
								</p>
								<p
									className={
										isDark ? "text-gray-300" : "text-gray-600"
									}
								>
									July 21, 2025
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Content Sections */}
				<div className="space-y-12">
					{/* Introduction */}
					<section>
						<h2
							className={`text-2xl font-bold mb-4 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Introduction
						</h2>
						<div
							className={`prose prose-lg max-w-none leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							<p>
								Welcome to{" "}
								<strong
									className={`cursor-default transition-colors duration-200 ${isDark
										? "text-red-400 hover:text-red-300"
										: "text-red-600 hover:text-red-700"
										} hover:underline`}
								>
									thapargo.com
								</strong>
								. We are committed to protecting your privacy and
								ensuring that your personal information is handled in a
								safe and responsible manner. This Privacy Policy
								outlines the types of information we collect from you,
								how we use it, how we store it, and the steps we take to
								ensure it is protected in compliance with Google OAuth
								requirements.
							</p>
						</div>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* Information We Collect */}
					<section>
						<h2
							className={`text-2xl font-bold mb-6 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Information We Collect
						</h2>
						<p
							className={`mb-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							When you use our Website and Google OAuth to sign in, we
							collect the following information:
						</p>
						<div className="grid md:grid-cols-3 gap-6">
							<Card
								className={`transition-all duration-300 hover:scale-105 ${isDark
									? "border-gray-700 hover:border-red-700 bg-gray-800/50"
									: "border-gray-200 hover:border-red-200 bg-white"
									}`}
							>
								<CardContent className="p-6">
									<div
										className={`mb-3 ${isDark ? "text-red-400" : "text-red-600"
											}`}
									>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-red-900/30" : "bg-red-100"
												}`}
										>
											<IdCard className="h-5 w-5" />
										</div>
									</div>
									<h3
										className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										Name
									</h3>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"
											}`}
									>
										We collect your name as provided by your Google
										account.
									</p>
								</CardContent>
							</Card>
							<Card
								className={`transition-all duration-300 hover:scale-105 ${isDark
									? "border-gray-700 hover:border-red-700 bg-gray-800/50"
									: "border-gray-200 hover:border-red-200 bg-white"
									}`}
							>
								<CardContent className="p-6">
									<div
										className={`mb-3 ${isDark ? "text-red-400" : "text-red-600"
											}`}
									>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-red-900/30" : "bg-red-100"
												}`}
										>
											<Mail className="h-5 w-5" />
										</div>
									</div>
									<h3
										className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										Email Address
									</h3>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"
											}`}
									>
										We collect your email address as provided by your
										Google account.
									</p>
								</CardContent>
							</Card>
							<Card
								className={`transition-all duration-300 hover:scale-105 ${isDark
									? "border-gray-700 hover:border-red-700 bg-gray-800/50"
									: "border-gray-200 hover:border-red-200 bg-white"
									}`}
							>
								<CardContent className="p-6">
									<div
										className={`mb-3 ${isDark ? "text-red-400" : "text-red-600"
											}`}
									>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-red-900/30" : "bg-red-100"
												}`}
										>
											<Camera className="h-5 w-5" />
										</div>
									</div>
									<h3
										className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										Profile Image
									</h3>
									<p
										className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"
											}`}
									>
										We collect your profile image as provided by your
										Google account.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* How We Use Your Information */}
					<section>
						<h2
							className={`text-2xl font-bold mb-6 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							How We Use Your Information
						</h2>
						<p
							className={`mb-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							The information we collect is used for the following
							purposes:
						</p>
						<div className="space-y-4">
							<div
								className={`flex items-start space-x-4 p-4 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"
									}`}
							>
								<div
									className={`w-2 h-2 rounded-full mt-3 ${isDark ? "bg-red-400" : "bg-red-600"
										}`}
								></div>
								<div>
									<h3
										className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										Authentication
									</h3>
									<p
										className={
											isDark ? "text-gray-300" : "text-gray-700"
										}
									>
										To authenticate your identity and provide you with
										access to our services.
									</p>
								</div>
							</div>
							<div
								className={`flex items-start space-x-4 p-4 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"
									}`}
							>
								<div
									className={`w-2 h-2 rounded-full mt-3 ${isDark ? "bg-red-400" : "bg-red-600"
										}`}
								></div>
								<div>
									<h3
										className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										Personalization
									</h3>
									<p
										className={
											isDark ? "text-gray-300" : "text-gray-700"
										}
									>
										To personalize your experience on our Website.
									</p>
								</div>
							</div>
							<div
								className={`flex items-start space-x-4 p-4 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"
									}`}
							>
								<div
									className={`w-2 h-2 rounded-full mt-3 ${isDark ? "bg-red-400" : "bg-red-600"
										}`}
								></div>
								<div>
									<h3
										className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										Communication
									</h3>
									<p
										className={
											isDark ? "text-gray-300" : "text-gray-700"
										}
									>
										To send you updates, notifications, and other
										information related to our services.
									</p>
								</div>
							</div>
						</div>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* Data Storage and Security */}
					<section>
						<h2
							className={`text-2xl font-bold mb-6 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Data Storage and Security
						</h2>
						<p
							className={`mb-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							We take the security of your personal information seriously
							and implement appropriate technical and organizational
							measures to protect it against unauthorized or unlawful
							processing and against accidental loss, destruction, or
							damage.
						</p>
						<div className="grid md:grid-cols-2 gap-6">
							<Card
								className={`transition-colors duration-300 ${isDark
									? "border-gray-700 bg-gray-800/50"
									: "border-gray-200 bg-white"
									}`}
							>
								<CardContent className="p-6">
									<h3
										className={`font-semibold mb-3 flex items-center ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										<Shield
											className={`h-5 w-5 mr-2 ${isDark ? "text-red-400" : "text-red-600"
												}`}
										/>
										Data Storage
									</h3>
									<p
										className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"
											}`}
									>
										Your data is stored securely on our servers and is
										only accessible by authorized personnel.
									</p>
								</CardContent>
							</Card>
							<Card
								className={`transition-colors duration-300 ${isDark
									? "border-gray-700 bg-gray-800/50"
									: "border-gray-200 bg-white"
									}`}
							>
								<CardContent className="p-6">
									<h3
										className={`font-semibold mb-3 flex items-center ${isDark ? "text-white" : "text-gray-900"
											}`}
									>
										<Shield
											className={`h-5 w-5 mr-2 ${isDark ? "text-red-400" : "text-red-600"
												}`}
										/>
										Encryption
									</h3>
									<p
										className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"
											}`}
									>
										We use industry-standard encryption to protect
										your data during transmission and storage.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* Sharing Your Information */}
					<section>
						<h2
							className={`text-2xl font-bold mb-4 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Sharing Your Information
						</h2>
						<p
							className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							We do not share your personal information with third-party
							services except as necessary to provide our services or as
							required by law. Your information is shared with Google
							OAuth for authentication purposes.
						</p>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* Your Rights */}
					<section>
						<h2
							className={`text-2xl font-bold mb-6 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Your Rights
						</h2>
						<p
							className={`mb-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							You have the following rights regarding your personal
							information:
						</p>
						<div className="space-y-4">
							<div
								className={`p-4 border rounded-lg transition-colors duration-300 ${isDark
									? "border-gray-700 bg-gray-800/30"
									: "border-gray-200 bg-white"
									}`}
							>
								<h3
									className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
										}`}
								>
									Access
								</h3>
								<p
									className={
										isDark ? "text-gray-300" : "text-gray-700"
									}
								>
									You have the right to access the personal information
									we hold about you.
								</p>
							</div>
							<div
								className={`p-4 border rounded-lg transition-colors duration-300 ${isDark
									? "border-gray-700 bg-gray-800/30"
									: "border-gray-200 bg-white"
									}`}
							>
								<h3
									className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
										}`}
								>
									Correction
								</h3>
								<p
									className={
										isDark ? "text-gray-300" : "text-gray-700"
									}
								>
									You have the right to correct any inaccuracies in
									your personal information.
								</p>
							</div>
							<div
								className={`p-4 border rounded-lg transition-colors duration-300 ${isDark
									? "border-gray-700 bg-gray-800/30"
									: "border-gray-200 bg-white"
									}`}
							>
								<h3
									className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
										}`}
								>
									Deletion
								</h3>
								<p
									className={
										isDark ? "text-gray-300" : "text-gray-700"
									}
								>
									You have the right to request the deletion of your
									personal information, subject to legal and
									contractual restrictions.
								</p>
							</div>
						</div>
						<p
							className={`mt-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							.
						</p>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* Changes to This Privacy Policy */}
					<section>
						<h2
							className={`text-2xl font-bold mb-4 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Changes to This Privacy Policy
						</h2>
						<p
							className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							We may update this Privacy Policy from time to time to
							reflect changes in our practices or legal requirements. We
							will notify you of any significant changes by posting the
							new Privacy Policy on our Website and updating the
							effective date at the top of this page.
						</p>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />

					{/* Contact Us */}
					<section>
						<h2
							className={`text-2xl font-bold mb-6 border-l-4 pl-4 ${isDark
								? "text-white border-red-400"
								: "text-gray-900 border-red-600"
								}`}
						>
							Contact Us
						</h2>
						<p
							className={`mb-6 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"
								}`}
						>
							If you have any questions or concerns about this Privacy
							Policy or our data practices, please contact us at:
						</p>
						<div className="grid md:grid-cols-2 gap-6">
							<Card
								className={`transition-colors duration-300 ${isDark
									? "border-red-700 bg-red-950/20"
									: "border-red-200 bg-red-50"
									}`}
							>
								<CardContent className="p-6">
									<div className="flex items-center space-x-3 mb-4">
										<Mail
											className={`h-6 w-6 ${isDark ? "text-red-400" : "text-red-600"
												}`}
										/>
										<h3
											className={`font-semibold ${isDark ? "text-white" : "text-gray-900"
												}`}
										>
											Email
										</h3>
									</div>
									<a
										href={`mailto:${projectConfig.team[0].email}`}
										className={`font-medium transition-colors duration-200 ${isDark
											? "text-red-400 hover:text-red-300"
											: "text-red-600 hover:text-red-700"
											}`}
									>
										{projectConfig.team[0].email}
									</a>
									<br />
									<a
										href={`mailto:${projectConfig.team[1].email}`}
										className={`font-medium transition-colors duration-200 ${isDark
											? "text-red-400 hover:text-red-300"
											: "text-red-600 hover:text-red-700"
											}`}
									>
										{projectConfig.team[1].email}
									</a>
								</CardContent>
							</Card>
							<Card
								className={`transition-colors duration-300 ${isDark
									? "border-red-700 bg-red-950/20"
									: "border-red-200 bg-red-50"
									}`}
							>
								<CardContent className="p-6">
									<div className="flex items-center space-x-3 mb-4">
										<MapPin
											className={`h-6 w-6 ${isDark ? "text-red-400" : "text-red-600"
												}`}
										/>
										<h3
											className={`font-semibold ${isDark ? "text-white" : "text-gray-900"
												}`}
										>
											Address
										</h3>
									</div>
									<p
										className={
											isDark ? "text-gray-300" : "text-gray-700"
										}
									>
										TIET Patiala
									</p>
								</CardContent>
							</Card>
						</div>
					</section>

					<Separator className={isDark ? "bg-gray-700" : "bg-gray-200"} />
				</div>
			</main>
		</div>
	);
}
