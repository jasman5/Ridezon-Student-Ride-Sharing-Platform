"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
	Clock,
	MapPin,
	Users,
	Car,
	AlertCircle,
	UserIcon as Female,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPoolSchema, type CreatePoolFormValues } from "@/schemas/schema";
import { calculateFormattedFarePerHead } from "@/lib/utils/pool-utils";
import { useToast } from "@/hooks/use-toast";

interface CreatePoolFormProps {
	onSubmit: (data: CreatePoolFormValues) => void;
	start_points: string[];
	end_points: string[];
	transport_modes: string[];
	onCancel: () => void;
}

/**
 * Simplified create pool form component with improved UX
 */
export function CreatePoolForm({
	onSubmit,
	start_points,
	end_points,
	transport_modes,
	onCancel,
}: Readonly<CreatePoolFormProps>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const [useCustomLocations, setUseCustomLocations] = useState(true);

	// Initialize the form
	const form = useForm<CreatePoolFormValues>({
		resolver: zodResolver(createPoolSchema),
		defaultValues: {
			start_point: "",
			end_point: "",
			departure_time: "",
			arrival_time: "",
			transport_mode: "",
			total_persons: 1,
			current_persons: 1,
			total_fare: 0,
			description: "",
			is_female_only: false,
			fare_per_head: 0,
		},
		mode: "onChange",
	});

	// Watch values for live calculations and validation
	const total_persons = form.watch("total_persons");
	const total_fare = form.watch("total_fare");
	const departure_time = form.watch("departure_time");
	const arrival_time = form.watch("arrival_time");

	// Calculate fare per head
	const fare_per_head = calculateFormattedFarePerHead(
		total_fare,
		total_persons,
	);

	// Validate arrival time is after departure time
	const isarrival_timeValid =
		!arrival_time ||
		!departure_time ||
		new Date(arrival_time) > new Date(departure_time);

	// Form submission handler
	const handleSubmit = async (data: CreatePoolFormValues) => {
		try {
			setIsSubmitting(true);
			data.fare_per_head = calculateFormattedFarePerHead(
				data.total_fare,
				data.total_persons,
			);
			await Promise.resolve(onSubmit(data));

			form.reset();

			toast({
				title: "Success",
				description: "Pool created successfully!",
			});
		} catch (error) {
			console.error("Error creating pool:", error);
			toast({
				title: "Create Pool Failed",
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
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Location Section */}
					<div className="space-y-4 md:col-span-2">
						<h3 className="text-lg font-medium text-primary flex items-center gap-2">
							<MapPin size={18} />
							Location
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="start_point"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Point</FormLabel>
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
													{start_points.map((point) => (
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
										<FormLabel>End Point</FormLabel>
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
													{end_points.map((point) => (
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
						<div className="flex items-center justify-start mt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									setUseCustomLocations(!useCustomLocations)
								}
								className="text-xs border-white/20 dark:border-white/10"
							>
								{useCustomLocations
									? "Select from existing locations"
									: "Enter custom locations"}
							</Button>
						</div>
					</div>

					{/* Time Section */}
					<div className="space-y-4 md:col-span-2">
						<h3 className="text-lg font-medium text-primary flex items-center gap-2">
							<Clock size={18} />
							Schedule
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="departure_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Departure Time</FormLabel>
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
										<FormLabel>Arrival Time</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												className={cn(
													"bg-white/20 dark:bg-black/20 border-white/20 dark:border-white/10",
													!isarrival_timeValid &&
													"border-red-500 focus-visible:ring-red-500",
												)}
											/>
										</FormControl>
										{!isarrival_timeValid && (
											<motion.p
												className="text-sm font-medium text-red-500 flex items-center gap-1 mt-1"
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
											>
												<AlertCircle size={14} />
												Arrival time must be after departure time
											</motion.p>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Transport & Capacity Section */}
					<div className="space-y-4 md:col-span-2">
						<h3 className="text-lg font-medium text-primary flex items-center gap-2">
							<Car size={18} />
							Transport & Capacity
						</h3>

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
													{transport_modes.map((mode) => (
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

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="total_persons"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-1">
											<Users size={16} />
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
											<Users size={16} />
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
										{field.value >
											form.getValues("total_persons") && (
												<motion.p
													className="text-sm font-medium text-red-500 flex items-center gap-1 mt-1"
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
												>
													<AlertCircle size={14} />
													Cannot exceed total persons
												</motion.p>
											)}
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="total_fare"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-1">
											<span>&#8377;</span> Total Fare
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
						</div>

						<div className="bg-white/10 dark:bg-black/10 p-3 rounded-md border border-white/10 dark:border-white/5">
							<div className="flex justify-between items-center">
								<Label className="flex items-center gap-1">
									<span className="text-primary">&#8377;</span> Fare
									Per Head
								</Label>
								<motion.div
									key={fare_per_head}
									initial={{ opacity: 0.8, y: -5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 5 }}
									transition={{ duration: 0.2 }}
									className="text-lg font-medium text-primary"
								>
									{fare_per_head}
								</motion.div>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Calculated automatically based on total fare and persons
							</p>
						</div>
					</div>

					{/* Details Section */}
					<div className="space-y-4 md:col-span-2">
						<h3 className="text-lg font-medium text-primary">
							Additional Details
						</h3>

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
										<FormLabel className="text-base flex items-center gap-2">
											<Female
												size={16}
												className="text-pink-500"
											/>
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
				</div>

				{/* Form Actions */}
				<div className="flex justify-end gap-2 mt-8">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						className="border-white/20 dark:border-white/10"
						disabled={isSubmitting}
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
							"Create Pool"
						)}
					</AnimatedButton>
				</div>
			</form>
		</Form>
	);
}
