"use client";

import type React from "react";

import {
	motion,
	useMotionValue,
	useTransform,
	AnimatePresence,
} from "framer-motion";
import {
	Clock,
	Users,
	Car,
	UserIcon as Female,
	MapPin,
	ArrowRight,
	Phone,
	ChevronDown,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import type { Pool } from "@/types/pool";
import { formatTime, formatDate } from "@/lib/utils/date-utils";
import { formatFarePerHead } from "@/lib/utils/pool-utils";
import { useState } from "react";

import type { CurrentUserDetailsProps } from "@/lib/auth";

interface PoolCardProps {
	pool: Pool;
	onClick: () => void;
	currentUser?: CurrentUserDetailsProps | null;
}

/**
 * Enhanced pool card component with advanced animations, glassmorphism, and member details
 */
export function PoolCard({ pool, onClick, currentUser }: Readonly<PoolCardProps>) {
	const [isHovered, setIsHovered] = useState(false);
	const [showMembers, setShowMembers] = useState(false);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotateX = useTransform(y, [-100, 100], [10, -10]);
	const rotateY = useTransform(x, [-100, 100], [-10, 10]);

	// Handle both naming conventions
	const startPoint = pool.start_point ?? pool.startPoint ?? "";
	const endPoint = pool.end_point ?? pool.endPoint ?? "";
	const departureTime = pool.departure_time ?? pool.departureTime ?? "";
	const arrivalTime = pool.arrival_time ?? pool.arrivalTime ?? "";
	const transportMode = pool.transport_mode ?? pool.transportMode ?? "";
	const totalPersons = pool.total_persons ?? pool.totalPersons ?? 0;
	const currentPersons = pool.current_persons ?? pool.currentPersons ?? 0;
	const isFemaleOnly = pool.is_female_only ?? pool.femaleOnly ?? false;
	const farePerHead =
		pool.fare_per_head ?? (pool.totalFare ? formatFarePerHead(pool) : "0.00");

	// Get creator name
	const creatorName =
		pool.created_by?.full_name ?? pool.createdBy ?? "Unknown";
	const creatorPhone = pool.created_by?.phone_number ?? "";
	const creatorGender = pool.created_by?.gender ?? "";

	// Get members
	const members = pool.members ?? [];
	const memberCount = Array.isArray(members) ? members.length : 0;

	// Determine occupied seats preferring backend count, otherwise fall back to
	// the union of members and passengers arrays to capture recently joined riders.
	// Determine occupied seats preferring backend count, otherwise fall back to
	// the union of members and passengers arrays to capture recently joined riders.
	const passengersArray = Array.isArray(pool.passengers)
		? pool.passengers
		: [];

	const uniqueParticipantIds = new Set<string>();

	[members, passengersArray].forEach((list) => {
		// list is either PoolMembers[] or Pool['passengers']
		// We need to handle the different structures safely
		if (!list) return;

		list.forEach((entry) => {
			// entry can be PoolMembers or passenger object
			// PoolMembers: id, full_name, email, ...
			// Passenger: id, fullName, userId, email, user { id, email } ...

			let identifier = "";

			if ('full_name' in entry) {
				// PoolMembers
				identifier = entry.id || entry.email || entry.full_name;
			} else {
				// Passenger
				identifier = entry.id || entry.userId || entry.user?.id || entry.email || entry.fullName;
			}

			if (identifier) {
				uniqueParticipantIds.add(identifier.toString().toLowerCase());
			}
		});
	});

	const fallbackOccupied = Math.max(uniqueParticipantIds.size, memberCount);
	const occupiedSeats = currentPersons > 0 ? currentPersons : fallbackOccupied;

	// Calculate available seats ensuring we never dip below zero.
	const availableSeats = Math.max(totalPersons - occupiedSeats, 0);

	// Handle mouse move for 3D effect
	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const xPct = (mouseX / width - 0.5) * 2;
		const yPct = (mouseY / height - 0.5) * 2;
		x.set(xPct * 50);
		y.set(yPct * 50);
	};

	// Reset motion values on mouse leave
	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
		setIsHovered(false);
	};

	// Toggle members visibility
	const toggleMembers = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowMembers(!showMembers);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
			className="h-full"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={handleMouseLeave}
			onMouseMove={handleMouseMove}
			style={{
				perspective: 1000,
			}}
		>
			<motion.div
				style={{
					rotateX,
					rotateY,
					transformStyle: "preserve-3d",
				}}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				layout
			>
				<GlassCard
					variant={isFemaleOnly ? "female" : "default"}
					onClick={onClick}
					className="h-full relative overflow-hidden"
					hoverEffect={false}
				>
					{/* Animated gradient background */}
					<div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
						<motion.div
							className={`w-full h-full bg-gradient-to-br ${isFemaleOnly
								? "from-pink-500/30 via-transparent to-pink-300/20"
								: "from-primary/30 via-transparent to-primary/20"
								}`}
							animate={{
								backgroundPosition: ["0% 0%", "100% 100%"],
							}}
							transition={{
								duration: 15,
								ease: "linear",
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							}}
						/>
					</div>

					{/* Animated border effect */}
					<AnimatePresence>
						{isHovered && (
							<motion.div
								className="absolute inset-0 rounded-xl pointer-events-none"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<motion.div
									className={`absolute inset-0 rounded-xl border-2 ${isFemaleOnly
										? "border-pink-500/50"
										: "border-primary/50"
										}`}
									animate={{
										boxShadow: [
											`0 0 0px ${isFemaleOnly
												? "rgba(236, 72, 153, 0.3)"
												: "rgba(220, 38, 38, 0.3)"
											}`,
											`0 0 8px ${isFemaleOnly
												? "rgba(236, 72, 153, 0.5)"
												: "rgba(220, 38, 38, 0.5)"
											}`,
											`0 0 0px ${isFemaleOnly
												? "rgba(236, 72, 153, 0.3)"
												: "rgba(220, 38, 38, 0.3)"
											}`,
										],
									}}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										repeatType: "reverse",
									}}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Glow effect on hover */}
					<AnimatePresence>
						{isHovered && (
							<motion.div
								className={`absolute inset-0 ${isFemaleOnly ? "bg-pink-500/10" : "bg-primary/10"
									}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							/>
						)}
					</AnimatePresence>

					<div className="p-5 flex flex-col h-full relative z-10">
						{/* Header with route and badge */}
						<div className="flex justify-between items-start mb-4">
							<div className="space-y-1">
								<div className="flex items-center gap-1">
									<MapPin
										size={16}
										className="text-primary"
									/>
									<h3 className="font-semibold text-lg text-primary flex items-center gap-1">
										<span className="truncate max-w-[80px] sm:max-w-[120px]">
											{startPoint}
										</span>
										<motion.div
											animate={{ x: [0, 5, 0] }}
											transition={{
												duration: 1.5,
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										>
											<ArrowRight
												size={16}
												className="text-primary mx-1"
											/>
										</motion.div>
										<span className="truncate max-w-[80px] sm:max-w-[120px]">
											{endPoint}
										</span>
									</h3>
								</div>
								<div className="text-sm text-foreground/70 dark:text-foreground/60 flex items-center gap-1">
									<span>by</span>
									<span className="font-medium">{creatorName}</span>
									{creatorGender && (
										<Badge
											className={`ml-1 ${creatorGender.toLowerCase() === "female"
												? "bg-pink-500/80"
												: "bg-blue-500/80"
												}`}
											variant="outline"
										>
											{creatorGender}
										</Badge>
									)}
								</div>
								{creatorPhone && (
									<p className="text-xs text-foreground/60 flex items-center gap-1">
										<Phone
											size={12}
											className="text-primary"
										/>
										{creatorPhone}
									</p>
								)}
							</div>

							{isFemaleOnly && (
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Badge className="bg-pink-500/80 hover:bg-pink-500/70 dark:bg-pink-500/80 dark:hover:bg-pink-500/70">
										<Female
											size={14}
											className="mr-1"
										/>
										Female Only
									</Badge>
								</motion.div>
							)}
						</div>

						{/* Request Status Badge */}
						{currentUser && pool.requests?.some(r => r.status === "PENDING" && (r.user?.email === currentUser.email || r.userId === currentUser.id)) && (
							<div className="mb-2">
								<Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50">
									Request Pending
								</Badge>
							</div>
						)}

						{/* Time information */}
						<div className="flex items-center gap-2 text-sm text-foreground/80 mb-4 bg-foreground/5 p-2 rounded-md">
							<Clock
								size={16}
								className="text-primary flex-shrink-0"
							/>
							<div className="flex flex-col">
								<span className="font-medium">
									{formatDate(departureTime)}
								</span>
								<span className="text-xs">
									{formatTime(departureTime)} -{" "}
									{formatTime(arrivalTime)}
								</span>
							</div>
						</div>

						{/* Stats grid */}
						<div className="grid grid-cols-3 gap-2 mb-4">
							<motion.div
								className="flex flex-col items-center p-2 rounded-md bg-foreground/5"
								whileHover={{
									y: -5,
									backgroundColor: "rgba(var(--primary), 0.1)",
								}}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
							>
								<Users
									size={18}
									className="text-primary mb-1"
								/>
								<span className="text-xs font-medium">
									{occupiedSeats}/{totalPersons}
								</span>
								<span className="text-[10px] text-foreground/60">
									Seats
								</span>
							</motion.div>

							<motion.div
								className="flex flex-col items-center p-2 rounded-md bg-foreground/5"
								whileHover={{
									y: -5,
									backgroundColor: "rgba(var(--primary), 0.1)",
								}}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
							>
								<Car
									size={18}
									className="text-primary mb-1"
								/>
								<span className="text-xs font-medium">
									{transportMode}
								</span>
								<span className="text-[10px] text-foreground/60">
									Vehicle
								</span>
							</motion.div>

							<motion.div
								className="flex flex-col items-center p-2 rounded-md bg-foreground/5"
								whileHover={{
									y: -5,
									backgroundColor: "rgba(var(--primary), 0.1)",
								}}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
							>
								<span
									className="text-primary mb-1"
									style={{ fontSize: "18px", fontWeight: "bold" }}
								>
									₹
								</span>
								<span className="text-xs font-medium">
									{farePerHead}
								</span>
								<span className="text-[10px] text-foreground/60">
									Per Person
								</span>
							</motion.div>
						</div>

						{/* Members section */}
						{members.length > 0 && (
							<motion.div
								className="mb-4"
								layout
							>
								<motion.button
									className="w-full flex items-center justify-between p-2 rounded-md bg-foreground/5 hover:bg-foreground/10 transition-colors text-sm font-medium"
									onClick={toggleMembers}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<span className="flex items-center gap-2">
										<User
											size={16}
											className="text-primary"
										/>
										Pool Members ({members.length})
									</span>
									<motion.div
										animate={{ rotate: showMembers ? 180 : 0 }}
										transition={{ duration: 0.2 }}
									>
										<ChevronDown size={16} />
									</motion.div>
								</motion.button>

								<AnimatePresence>
									{showMembers && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{
												duration: 0.3,
												ease: "easeInOut",
											}}
											className="overflow-hidden"
										>
											<div className="pt-2 space-y-2 max-h-32 overflow-y-auto">
												{members.map((member, index) => (
													<motion.div
														key={member.id ?? index}
														initial={{ x: -20, opacity: 0 }}
														animate={{ x: 0, opacity: 1 }}
														transition={{ delay: index * 0.1 }}
														className="flex items-center justify-between p-2 rounded-md bg-foreground/5 border border-foreground/10"
													>
														<div className="flex items-center gap-2">
															<div
																className={`w-2 h-2 rounded-full ${member.is_creator
																	? "bg-yellow-500"
																	: "bg-green-500"
																	}`}
															/>
															<div className="flex flex-col">
																<span className="text-xs font-medium">
																	{member.full_name}
																	{member.is_creator && (
																		<Badge className="ml-1 text-[10px] py-0 px-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
																			Creator
																		</Badge>
																	)}
																</span>
																<div className="flex items-center gap-1">
																	<Phone
																		size={10}
																		className="text-primary"
																	/>
																	<span className="text-[10px] text-foreground/60">
																		{member?.phone_number ? (
																			member.phone_number
																		) : (
																			<span className="text-foreground/60">
																				No phone number
																			</span>
																		)}
																	</span>
																</div>
															</div>
														</div>
														<Badge
															className={`text-[10px] ${member.gender?.toLowerCase() ===
																"female"
																? "bg-pink-500/20 text-pink-700 dark:text-pink-400"
																: member.gender?.toLowerCase() ===
																	"male"
																	? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
																	: "bg-gray-500/20 text-gray-700 dark:text-gray-400"
																}`}
															variant="outline"
														>
															{member.gender ? member.gender : "Unknown"}
														</Badge>
													</motion.div>
												))}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						)}

						{/* Available seats indicator */}
						<motion.div
							className={`mt-auto p-2 rounded-md text-center text-sm font-medium ${availableSeats > 0
								? "bg-green-500/10 text-green-600 dark:text-green-400"
								: "bg-red-500/10 text-red-600 dark:text-red-400"
								}`}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							{availableSeats > 0
								? `${availableSeats} ${availableSeats === 1 ? "seat" : "seats"
								} available`
								: "No seats available"}
						</motion.div>
					</div>

					{/* Interactive hover effect */}
					<AnimatePresence>
						{isHovered && (
							<motion.div
								className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
								initial={{ x: "-100%" }}
								animate={{ x: "100%" }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.8, ease: "easeInOut" }}
							/>
						)}
					</AnimatePresence>
				</GlassCard>
			</motion.div>
		</motion.div>
	);
}
