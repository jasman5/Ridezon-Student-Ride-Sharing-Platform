"use client";

import type React from "react";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Pool, PoolMembers } from "@/types/pool";
import { PoolCard } from "@/components/pool/pool-card";
import { PoolDetails } from "@/components/pool/pool-details";
import { FilterSidebar } from "@/components/pool/filter-sidebar";
import { usePoolFilters } from "@/hooks/use-pool-filters";
import type { CreatePoolFormValues } from "@/schemas/schema";
import { CreatePoolForm } from "@/components/pool/create-pool-form";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { poolApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PoolNavbar } from "@/components/poolNavbar";
import { calculateFormattedFarePerHead } from "@/lib/utils/pool-utils";
import { authApi } from "@/lib";
import type { CurrentUserDetailsProps } from "@/lib/auth";
import { useRouter } from "next/navigation";

/**
 * Main dashboard component for the car pooling application
 */
export default function PoolDashboard() {
	// State for dialogs
	const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isCreatePoolOpen, setIsCreatePoolOpen] = useState(false);
	const [pools, setPools] = useState<Pool[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentUser, setCurrentUser] =
		useState<CurrentUserDetailsProps | null>(null);
	const { toast } = useToast();
	const router = useRouter();

	// Load pool data on component mount
	useEffect(() => {
		async function fetchPools() {
			try {
				setIsLoading(true);
				const poolData = await poolApi.getAllPools();
				setPools(poolData);
			} catch (error) {
				console.error("Error fetching pools:", error);
				toast({
					title: "Pool Data Fetch Failed",
					description:
						error instanceof Error ? error.message : String(error),
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		}

		async function fetchUserDetails() {
			try {
				setIsLoading(true);
				const userDetails = await authApi.getCurrentUser();
				if (userDetails) {
					sessionStorage.setItem("user", JSON.stringify(userDetails));
					setCurrentUser(userDetails);
				}
			} catch (error) {
				console.error("Error fetching user details:", error);
				toast({
					title: "User Data Fetch Failed",
					description:
						error instanceof Error ? error.message : String(error),
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		}

		fetchPools();
		fetchUserDetails();
	}, [toast, router]);

	// Failsafe effect to check and fetch user details if needed
	useEffect(() => {
		const ensureUserInState = async () => {
			// Check if user is in session storage but not in state
			const userFromStorage = sessionStorage.getItem("user");
			if (userFromStorage && !currentUser) {
				try {
					const parsedUser = JSON.parse(
						userFromStorage,
					) as CurrentUserDetailsProps;
					setCurrentUser(parsedUser);
				} catch (error) {
					console.error("Error parsing user from session storage:", error);
					// If parsing fails, fetch fresh user data
					try {
						const userDetails = await authApi.getCurrentUser();
						if (userDetails) {
							sessionStorage.setItem(
								"user",
								JSON.stringify(userDetails),
							);
							setCurrentUser(userDetails);
						}
					} catch (fetchError) {
						console.error("Error fetching user details:", fetchError);
					}
				}
			} else if (!userFromStorage && !currentUser) {
				// Neither in storage nor state, fetch from API
				try {
					const userDetails = await authApi.getCurrentUser();
					if (userDetails) {
						sessionStorage.setItem("user", JSON.stringify(userDetails));
						setCurrentUser(userDetails);
					}
				} catch (error) {
					console.error("Error fetching user details:", error);
				}
			}
		};

		ensureUserInState();
	}, [currentUser]);

	const myPools = useMemo(() => {
		if (!currentUser) return [];

		return pools.filter(
			(pool: Pool) => pool.created_by?.email === currentUser.email,
		);
	}, [pools, currentUser]);

	const joinedPools = useMemo(() => {
		if (!currentUser) return [];

		const normalize = (value?: string | number | null) =>
			value?.toString().trim().toLowerCase() ?? "";

		return pools.filter((pool: Pool) => {
			const normalizedUserName = normalize(currentUser.full_name);
			const normalizedUserPhone = normalize(currentUser.phone_number);
			const normalizedUserId = normalize(currentUser.id);
			const normalizedUserEmail = normalize(currentUser.email);

			const matchesMember = pool.members?.some((member: PoolMembers) => {
				const createIdCandidates = [
					member.id,
					member.email,
					member.full_name,
					member.phone_number,
				];

				return createIdCandidates.some((candidate) => {
					const normalizedCandidate = normalize(candidate);
					return (
						normalizedCandidate === normalizedUserId ||
						normalizedCandidate === normalizedUserEmail ||
						normalizedCandidate === normalizedUserName ||
						normalizedCandidate === normalizedUserPhone
					);
				});
			});

			const matchesPassenger = Array.isArray((pool as any).passengers)
				? (pool as any).passengers.some((passenger: any) => {
					const candidates = [
						passenger?.id,
						passenger?.email,
						passenger?.fullName,
						passenger?.phone,
						passenger?.userId,
						passenger?.user?.id,
						passenger?.user?.email,
					];

					return candidates.some((candidate) => {
						const normalizedCandidate = normalize(candidate);
						return (
							normalizedCandidate === normalizedUserId ||
							normalizedCandidate === normalizedUserEmail ||
							normalizedCandidate === normalizedUserName ||
							normalizedCandidate === normalizedUserPhone
						);
					});
				})
				: false;

			const isCreator =
				normalize(pool.created_by?.email) === normalizedUserEmail ||
				normalize((pool as any).creator?.email) === normalizedUserEmail;

			return !isCreator && (matchesMember || matchesPassenger);
		});
	}, [pools, currentUser]);

	// Dynamically extract unique values from the current pool data
	const dynamicFilterOptions = useMemo(() => {
		if (!pools.length)
			return {
				startPoints: [],
				endPoints: [],
				transportModes: [],
				fareRange: { min: 0, max: 100 },
			};

		// Extract unique start points
		const startPoints = Array.from(
			new Set(
				pools.map((pool) => {
					return pool.start_point || pool.startPoint || "";
				}),
			),
		).filter(Boolean);

		// Extract unique end points
		const endPoints = Array.from(
			new Set(
				pools.map((pool) => {
					return pool.end_point || pool.endPoint || "";
				}),
			),
		).filter(Boolean);

		// Extract unique transport modes
		const transportModes = Array.from(
			new Set(
				pools.map((pool) => {
					return pool.transport_mode || pool.transportMode || "";
				}),
			),
		).filter(Boolean);

		// Calculate fare range
		const fares = pools.map((pool) => {
			if (pool.fare_per_head) {
				return Number.parseFloat(pool.fare_per_head);
			} else if (
				pool.totalFare &&
				(pool.total_persons || pool.totalPersons)
			) {
				const totalPersons = pool.total_persons || pool.totalPersons || 1;
				return pool.totalFare / totalPersons;
			}
			return 0;
		});

		const fareRange = {
			min: Math.floor(Math.min(...fares)),
			max: Math.ceil(Math.max(...fares)),
		};

		return { startPoints, endPoints, transportModes, fareRange };
	}, [pools]);

	// Use custom hook for filtering
	const {
		filters,
		updateFilter,
		resetFilters,
		filteredPools,
		setInitialFareRange,
	} = usePoolFilters(pools);

	// Update fare range when it changes
	useEffect(() => {
		if (
			dynamicFilterOptions.fareRange.min !== undefined &&
			dynamicFilterOptions.fareRange.max !== undefined
		) {
			setInitialFareRange(
				dynamicFilterOptions.fareRange.min,
				dynamicFilterOptions.fareRange.max,
			);
		}
	}, [dynamicFilterOptions.fareRange, setInitialFareRange]);

	// Handle search input
	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFilter("searchQuery", e.target.value);
		},
		[updateFilter],
	);

	// Handle pool selection
	const handlePoolSelect = useCallback((pool: Pool) => {
		setSelectedPool(pool);
	}, []);

	// Handle form submission
	const handleCreatePool = async (data: CreatePoolFormValues) => {
		try {
			data.fare_per_head = calculateFormattedFarePerHead(
				data.total_fare,
				data.total_persons,
			);
			await poolApi.createPool(data);
			// Refresh pools after creating a new one
			const updatedPools = await poolApi.getAllPools();
			setPools(updatedPools);
			setIsCreatePoolOpen(false);

			return true;
		} catch (error) {
			console.error("Error creating pool:", error);
			toast({
				title: "Get All Pool Fetch",
				description: error instanceof Error ? error.message : String(error),
				variant: "destructive",
			});
			return Promise.reject(
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	};

	// Check if user is creator of selected pool
	const isCurrentUserCreator = useMemo(() => {
		if (!selectedPool || !currentUser) return false;

		// Check by email if available (more reliable)
		if (selectedPool.created_by?.email && currentUser.email) {
			return selectedPool.created_by.email === currentUser.email;
		}

		// Fallback to name check
		return selectedPool.created_by?.full_name === currentUser.full_name;
	}, [selectedPool, currentUser]);

	// Handle pool update
	const handlePoolUpdated = useCallback(async () => {
		try {
			const updatedPools = await poolApi.getAllPools();
			setPools(updatedPools);
			toast({
				title: "Success",
				description: "Pool list refreshed with latest data",
			});
		} catch (error) {
			console.error("Error refreshing pools:", error);
			toast({
				title: "Get All Pool Fetch Failed",
				description: error instanceof Error ? error.message : String(error),
				variant: "destructive",
			});
		}
	}, [toast]);

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<AnimatedBackground
			variant="paths"
			intensity="subtle"
			className="min-h-screen"
		>
			{/* Header */}
			<PoolNavbar onCreatePool={() => setIsCreatePoolOpen(true)} />

			{/* Search and Filter Section */}
			<div className="container mx-auto p-4">
				<motion.div
					className="flex flex-col sm:flex-row gap-2 mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="relative flex-grow">
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
							size={18}
						/>
						<Input
							placeholder="Search by creator..."
							className="pl-10 bg-card/50 backdrop-blur-md border-border placeholder:text-muted-foreground text-foreground focus:ring-primary"
							value={filters.searchQuery}
							onChange={handleSearchChange}
						/>
					</div>
					<div className="flex gap-2">
						{/* Create Pool button for mobile - hidden on desktop since it's in navbar */}
						<Button
							onClick={() => setIsCreatePoolOpen(true)}
							className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 md:hidden whitespace-nowrap flex-[2]"
						>
							<PlusCircle size={18} />
							Create Pool
						</Button>
						<div className="flex-[1] md:flex-none">
							<FilterSidebar
								open={isFilterOpen}
								onOpenChange={setIsFilterOpen}
								filters={filters}
								onUpdateFilter={updateFilter}
								onResetFilters={resetFilters}
								startPoints={dynamicFilterOptions.startPoints}
								endPoints={dynamicFilterOptions.endPoints}
								transportModes={dynamicFilterOptions.transportModes}
								fareRange={dynamicFilterOptions.fareRange}
							/>
						</div>
					</div>
				</motion.div>

				{/* View Tabs */}
				<Tabs
					defaultValue="all"
					className="mb-6"
				>
					<TabsList className="bg-card/50 backdrop-blur-md border border-border w-full sm:w-auto">
						<TabsTrigger
							value="all"
							className="flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							All Pools
						</TabsTrigger>
						<TabsTrigger
							value="my"
							className="flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							My Pools
						</TabsTrigger>
						<TabsTrigger
							value="joined"
							className="flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							Joined by Me
						</TabsTrigger>
					</TabsList>
					<TabsContent
						value="all"
						className="mt-4"
					>
						{/* Pool Cards */}
						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
							</div>
						) : (
							<motion.div
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
								variants={container}
								initial="hidden"
								animate="show"
							>
								{filteredPools.length > 0 ? (
									filteredPools.map((pool) => (
										<motion.div
											key={pool.id}
											variants={item}
										>
											<PoolCard
												pool={pool}
												onClick={() => handlePoolSelect(pool)}
												currentUser={currentUser}
											/>
										</motion.div>
									))
								) : (
									<motion.div
										className="col-span-full text-center py-10 text-muted-foreground"
										variants={item}
									>
										No pools match your search criteria
									</motion.div>
								)}
							</motion.div>
						)}
					</TabsContent>
					<TabsContent value="my">
						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
							</div>
						) : myPools.length > 0 ? (
							<motion.div
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
								variants={container}
								initial="hidden"
								animate="show"
							>
								{myPools.map((pool) => (
									<motion.div
										key={pool.id}
										variants={item}
									>
										<PoolCard
											pool={pool}
											onClick={() => handlePoolSelect(pool)}
											currentUser={currentUser}
										/>
									</motion.div>
								))}
							</motion.div>
						) : (
							<motion.div
								className="text-center py-10 text-muted-foreground"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
							>
								You haven&apos;t created any pools yet
							</motion.div>
						)}
					</TabsContent>
					<TabsContent value="joined">
						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
							</div>
						) : joinedPools.length > 0 ? (
							<motion.div
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
								variants={container}
								initial="hidden"
								animate="show"
							>
								{joinedPools.map((pool: Pool) => (
									<motion.div
										key={pool.id}
										variants={item}
									>
										<PoolCard
											pool={pool}
											onClick={() => handlePoolSelect(pool)}
											currentUser={currentUser}
										/>
									</motion.div>
								))}
							</motion.div>
						) : (
							<motion.div
								className="text-center py-10 text-muted-foreground"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
							>
								You haven&apos;t joined any pools yet
							</motion.div>
						)}
					</TabsContent>
				</Tabs>
			</div>

			{/* Pool Details Dialog */}
			<PoolDetails
				pool={selectedPool}
				open={!!selectedPool}
				onOpenChange={(open) => !open && setSelectedPool(null)}
				onPoolUpdated={handlePoolUpdated}
				startPoints={dynamicFilterOptions.startPoints}
				endPoints={dynamicFilterOptions.endPoints}
				transportModes={dynamicFilterOptions.transportModes}
				isCurrentUserCreator={isCurrentUserCreator}
				currentUser={currentUser}
			/>

			{/* Create Pool Dialog */}
			<Dialog
				open={isCreatePoolOpen}
				onOpenChange={setIsCreatePoolOpen}
			>
				<DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl border border-border max-h-[90vh] overflow-y-auto p-4 sm:p-6">
					<DialogHeader>
						<DialogTitle className="text-xl text-primary">
							Create New Pool
						</DialogTitle>
						<DialogDescription>
							Fill in the details to create a new car pool.
						</DialogDescription>
					</DialogHeader>

					<CreatePoolForm
						onSubmit={handleCreatePool}
						start_points={dynamicFilterOptions.startPoints}
						end_points={dynamicFilterOptions.endPoints}
						transport_modes={dynamicFilterOptions.transportModes}
						onCancel={() => setIsCreatePoolOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</AnimatedBackground>
	);
}
