"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AnimatedButton } from "@/components/ui/animated-button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPoolSchema, type CreatePoolFormValues } from "@/schemas/schema";
import { calculateFormattedFarePerHead, formatDateForInput } from "@/lib/utils/pool-utils";
import { useToast } from "@/hooks/use-toast";
import { poolApi } from "@/lib/api";
import type { Pool } from "@/types/pool";

interface EditPoolFormProps {
	pool: Pool;
	startPoints: string[];
	endPoints: string[];
	transportModes: string[];
	onCancel: () => void;
	onSuccess: () => void;
}

/**
 * Edit pool form component
 */
export function EditPoolForm({
	pool,
	startPoints,
	endPoints,
	transportModes,
	onCancel,
	onSuccess,
}: Readonly<EditPoolFormProps>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const [useCustomLocations, setUseCustomLocations] = useState(false);

	// Initialize the form with pool data
	const form = useForm<CreatePoolFormValues>({
		resolver: zodResolver(createPoolSchema),
		defaultValues: {
			start_point: pool.start_point ?? pool.startPoint ?? "",
			end_point: pool.end_point ?? pool.endPoint ?? "",
			departure_time: formatDateForInput(pool.departure_time ?? pool.departureTime),
			arrival_time: formatDateForInput(pool.arrival_time ?? pool.arrivalTime),
			transport_mode: pool.transport_mode ?? pool.transportMode ?? "",
			total_persons: pool.total_persons ?? pool.totalPersons ?? 1,
			current_persons: pool.current_persons ?? pool.currentPersons ?? 1,
			total_fare:
				pool.totalFare ??
				(pool.fare_per_head
					? Number.parseFloat(pool.fare_per_head) *
					(pool.total_persons ?? pool.totalPersons ?? 1)
					: 0),
			description: pool.description ?? "",
			is_female_only: pool.is_female_only ?? pool.femaleOnly ?? false,
		},
	});

	// Watch values for live calculations
	const totalPersons = form.watch("total_persons");
	const totalFare = form.watch("total_fare");

	// Calculate fare per head
	const farePerHead = calculateFormattedFarePerHead(totalFare, totalPersons);

	// Form submission handler
	const handleSubmit = async (data: CreatePoolFormValues) => {
		try {
			setIsSubmitting(true);
			data.fare_per_head = farePerHead;
			await poolApi.updatePool(pool.id, data);

			toast({
				title: "Success",
				description: "Pool updated successfully!",
			});

			onSuccess();
		} catch (error) {
			console.error("Error updating pool:", error);
			toast({
				title: "Edit Pool Failed",
				description: error instanceof Error ? error.message : String(error),
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-6"
			>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="start_point"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<MapPin
											size={16}
											className="text-primary"
										/>
										Start Point
									</FormLabel>
									{!useCustomLocations ? (
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10">
													<SelectValue placeholder="Select start point" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="bg-background/80 backdrop-blur-lg border-white/20 dark:border-white/10">
												{startPoints.map((point) => (
													<SelectItem
														key={point}
														value={point}
													>
														{point}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<FormControl>
											<Input
												placeholder="Enter start point"
												{...field}
												className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
											/>
										</FormControl>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="end_point"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<MapPin
											size={16}
											className="text-primary"
										/>
										End Point
									</FormLabel>
									{!useCustomLocations ? (
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10">
													<SelectValue placeholder="Select end point" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="bg-background/80 backdrop-blur-lg border-white/20 dark:border-white/10">
												{endPoints.map((point) => (
													<SelectItem
														key={point}
														value={point}
													>
														{point}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<FormControl>
											<Input
												placeholder="Enter end point"
												{...field}
												className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
											/>
										</FormControl>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex items-center justify-end mt-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setUseCustomLocations(!useCustomLocations)}
							className="text-xs border-white/20 dark:border-white/10"
						>
							{useCustomLocations
								? "Use dropdown locations"
								: "Enter custom locations"}
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="departure_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<Clock
											size={16}
											className="text-primary"
										/>
										Departure Time
									</FormLabel>
									<FormControl>
										<Input
											type="datetime-local"
											{...field}
											className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="arrival_time"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<Clock
											size={16}
											className="text-primary"
										/>
										Arrival Time
									</FormLabel>
									<FormControl>
										<Input
											type="datetime-local"
											{...field}
											className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="transport_mode"
						render={({ field }) => (
							<>
								{!useCustomLocations ? (
									<FormItem>
										<FormLabel>Transport Mode</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10">
													<SelectValue placeholder="Select mode" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="bg-background/80 backdrop-blur-lg border-white/20 dark:border-white/10">
												{transportModes.map((mode) => (
													<SelectItem
														key={mode}
														value={mode}
													>
														{mode}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								) : (
									<FormItem>
										<FormLabel>Transport Mode</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter transport mode"
												{...field}
												className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</>
						)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="total_persons"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<Users
											size={16}
											className="text-primary"
										/>
										Total Persons
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={1}
											max={20}
											{...field}
											className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="current_persons"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<Users
											size={16}
											className="text-primary"
										/>
										Current Persons
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={1}
											max={form.getValues("total_persons")}
											{...field}
											className={cn(
												"bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10",
												field.value >
												form.getValues("total_persons") &&
												"border-red-500 focus-visible:ring-red-500",
											)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="total_fare"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-1">
										<span
											className="text-primary"
											style={{ fontSize: "16px", lineHeight: "1" }}
										>
											₹
										</span>{" "}
										Total Fare
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											step={0.01}
											{...field}
											className="bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div>
							<FormLabel className="flex items-center gap-1">
								<span
									className="text-primary"
									style={{ fontSize: "16px", lineHeight: "1" }}
								>
									₹
								</span>{" "}
								Fare Per Head
							</FormLabel>
							<motion.div
								key={farePerHead}
								initial={{ opacity: 0.8, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 5 }}
								transition={{ duration: 0.2 }}
								className="h-10 px-3 py-2 rounded-md border border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20 text-sm mt-2 flex items-center"
							>
								{farePerHead}
							</motion.div>
							<p className="text-sm text-muted-foreground mt-1">
								Calculated automatically
							</p>
						</div>
					</div>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe your pool (e.g., amenities, rules, etc.)"
										className="resize-none min-h-[100px] bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Provide details about your pool to attract more
									participants.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="is_female_only"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 dark:border-white/10 p-4 bg-white/20 dark:bg-black/20">
								<div className="space-y-0.5">
									<FormLabel className="text-base">
										Female Only Pool
									</FormLabel>
									<FormDescription>
										Restrict this pool to female participants only.
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<div className="flex justify-end gap-2 mt-4">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						className="border-white/20 dark:border-white/10"
					>
						Cancel
					</Button>
					<AnimatedButton
						type="submit"
						className="bg-primary hover:bg-primary/90"
						glowColor="rgba(255, 0, 0, 0.3)"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<div className="h-5 w-5 border-2 border-primary-foreground/50 border-t-transparent rounded-full animate-spin" />
						) : (
							"Update Pool"
						)}
					</AnimatedButton>
				</div>
			</form>
		</Form>
	);
}
