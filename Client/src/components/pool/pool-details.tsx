"use client";

import {
	MapPin,
	Clock,
	Users,
	Car,
	UserIcon as Female,
	Phone,
	Edit,
	Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import type { Pool } from "@/types/pool";
import { formatTime, formatDate } from "@/lib/utils/date-utils";
import { useState } from "react";
import { EditPoolForm } from "@/components/pool/edit-pool-form";
import { poolApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PoolDetailsProps {
	pool: Pool | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onPoolUpdated?: () => void;
	startPoints?: string[];
	endPoints?: string[];
	transportModes?: string[];
	isCurrentUserCreator?: boolean;
}

/**
 * Pool details dialog component
 */
export function PoolDetails({
	pool,
	open,
	onOpenChange,
	onPoolUpdated,
	startPoints = [],
	endPoints = [],
	transportModes = [],
	isCurrentUserCreator = false,
}: Readonly<PoolDetailsProps>) {
	const [isJoining, setIsJoining] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();

	if (!pool) return null;

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
		pool.fare_per_head ??
		(pool.totalFare ? (pool.totalFare / totalPersons).toFixed(2) : "0.00");
	const description = pool.description ?? "";

	// Get creator info
	const creatorName =
		pool.created_by?.full_name ?? pool.createdBy ?? "Unknown";
	const creatorPhone = pool.created_by?.phone_number ?? "";
	const creatorGender = pool.created_by?.gender ?? "";

	const handleJoinPool = async () => {
		if (!pool) return;

		try {
			setIsJoining(true);
			await poolApi.joinPool(pool.id);

			toast({
				title: "Success",
				description: "You have successfully joined the pool!",
			});

			// Close the dialog
			onOpenChange(false);
		} catch (error) {
			console.error("Error joining pool:", error);
			toast({
				title: "Join Pool Failed",
				description: error instanceof Error ? error.message : String(error),
				variant: "destructive",
			});

		} finally {
			setIsJoining(false);
		}
	};

	const handlePoolUpdated = async () => {
		setIsEditing(false);

		// Notify parent component that pool was updated
		if (onPoolUpdated) {
			onPoolUpdated();
		}
	};

	const handleDeletePool = async () => {
		if (!pool) return;

		try {
			setIsDeleting(true);
			await poolApi.deletePool(pool.id);

			toast({
				title: "Success",
				description: "Pool deleted successfully",
			});

			onOpenChange(false);
			if (onPoolUpdated) {
				onPoolUpdated();
			}
		} catch (error) {
			console.error("Error deleting pool:", error);
			toast({
				title: "Error",
				description: "Failed to delete pool",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<Dialog
					open={open}
					onOpenChange={onOpenChange}
				>
					<DialogContent className="sm:max-w-[500px] bg-background/80 backdrop-blur-lg border border-white/20 dark:border-white/10 max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="text-xl text-primary">
								Pool Details
							</DialogTitle>
							<DialogDescription className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<span>
										Created by{" "}
										<span className="font-medium">{creatorName}</span>
									</span>
									{creatorGender && (
										<Badge
											className={`${creatorGender.toLowerCase() === "female"
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
									<div className="flex items-center gap-1 text-xs">
										<Phone
											size={12}
											className="text-primary"
										/>
										{creatorPhone}
									</div>
								)}
							</DialogDescription>
						</DialogHeader>

						<motion.div
							className="space-y-4 py-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Start Point
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<MapPin
											size={16}
											className="text-primary"
										/>
										{startPoint}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										End Point
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<MapPin
											size={16}
											className="text-primary"
										/>
										{endPoint}
									</p>
								</div>
							</div>

							<Separator className="bg-white/20 dark:bg-white/10" />

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Departure
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<Clock
											size={16}
											className="text-primary"
										/>
										{formatTime(departureTime)}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{formatDate(departureTime)}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Arrival
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<Clock
											size={16}
											className="text-primary"
										/>
										{formatTime(arrivalTime)}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{formatDate(arrivalTime)}
									</p>
								</div>
							</div>

							<Separator className="bg-white/20 dark:bg-white/10" />

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Transport Mode
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<Car
											size={16}
											className="text-primary"
										/>
										{transportMode}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Persons
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<Users
											size={16}
											className="text-primary"
										/>
										{currentPersons}/{totalPersons}
									</p>
								</div>
							</div>

							<Separator className="bg-white/20 dark:bg-white/10" />

							<div className="grid grid-cols-1 gap-4">
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Fare per Person
									</h4>
									<p className="flex items-center gap-1 mt-1">
										<span
											className="text-primary"
											style={{ fontSize: 16 }}
										>
											₹
										</span>
										{farePerHead}
									</p>
								</div>
							</div>

							{isFemaleOnly && (
								<motion.div
									className="bg-pink-50/30 dark:bg-pink-950/30 backdrop-blur-md p-3 rounded-md flex items-center gap-2 mt-2 border border-pink-200/50 dark:border-pink-500/20"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.2 }}
								>
									<Female
										size={18}
										className="text-pink-500"
									/>
									<span className="text-pink-700 dark:text-pink-300 font-medium">
										Female only pool
									</span>
								</motion.div>
							)}

							<div>
								<h4 className="text-sm font-medium text-muted-foreground">
									Description
								</h4>
								<p className="mt-1 text-foreground">{description}</p>
							</div>
						</motion.div>

						<div className="flex justify-end gap-2 mt-4">
							{isEditing ? (
								<EditPoolForm
									pool={pool}
									startPoints={startPoints}
									endPoints={endPoints}
									transportModes={transportModes}
									onCancel={() => setIsEditing(false)}
									onSuccess={handlePoolUpdated}
								/>
							) : (
								<>
									{isCurrentUserCreator && (
										<>
											<Button
												variant="destructive"
												onClick={handleDeletePool}
												className="flex items-center gap-1"
												disabled={isDeleting}
											>
												{isDeleting ? (
													<div className="h-4 w-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
												) : (
													<>
														<Trash2 size={16} />
														Delete
													</>
												)}
											</Button>
											<Button
												variant="outline"
												onClick={() => setIsEditing(true)}
												className="border-white/20 dark:border-white/10 flex items-center gap-1"
											>
												<Edit size={16} />
												Edit
											</Button>
										</>
									)}

									{!isCurrentUserCreator && (
										<AnimatedButton
											className="bg-primary hover:bg-primary/90"
											glowColor="rgba(255, 0, 0, 0.3)"
											onClick={handleJoinPool}
											disabled={isJoining}
										>
											{isJoining ? (
												<div className="h-5 w-5 border-2 border-primary-foreground/50 border-t-transparent rounded-full animate-spin mx-auto" />
											) : (
												"Join Pool"
											)}
										</AnimatedButton>
									)}
								</>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</AnimatePresence>
	);

}
