import { toast } from "@/hooks/use-toast";
import type { Pool } from "@/types/pool";
import type { CreatePoolFormValues } from "@/schemas/schema";

const API_BASE_URL = "https://ridezon.mlsctiet.com/api";

/**
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	errorMessage = "An error occurred",
): Promise<T> {
	try {
		const accessToken =
			typeof window !== "undefined"
				? sessionStorage.getItem("access")
				: null;

		// Set default headers
		const headers = {
			"Content-Type": "application/json",
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
			...options.headers,
		};

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers,
		});

		// Handle non-2xx responses
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const message = errorData.detail ?? errorData.message ?? errorMessage;
			console.error(`API Error (${response.status}):`, message, errorData);
			throw new Error(errorData.detail || message);
		}

		// Parse JSON response
		const data = await response.json();
		return data as T;
	} catch (error) {
		console.error("API Request Error:", error);

		// Show toast notification
		toast({
			title: "Error",
			description: error instanceof Error ? error.message : String(error),
			variant: "destructive",
		});

		throw error;
	}
}

// Backend Interfaces
interface BackendUser {
	id: string;
	email: string;
	fullName: string;
	phone?: string;
	gender?: "Male" | "Female" | "Others";
}

interface BackendPassenger extends BackendUser {
	userId?: string; // Sometimes it might be nested or flat depending on endpoint
}

interface BackendRequest {
	id: string;
	status: "PENDING" | "ACCEPTED" | "REJECTED";
	userId: string;
	user?: BackendUser;
}

interface BackendRide {
	id: string | number;
	origin: string;
	destination: string;
	departureTime: string;
	transportMode: string;
	totalSeats: number;
	pricePerSeat: number | null;
	description: string;
	genderPreference: string;
	creatorId: string;
	creator?: BackendUser;
	passengers?: BackendPassenger[];
	requests?: BackendRequest[];
	group?: {
		id: string;
	};
	// Add other fields if necessary
}

/**
 * Pool API Service
 */
/**
 * Helper to map backend Ride object to frontend Pool object
 */
const mapRideToPool = (ride: BackendRide): Pool => {
	return {
		id: ride.id,
		// Map backend fields to frontend snake_case fields
		start_point: ride.origin,
		end_point: ride.destination,
		departure_time: ride.departureTime,
		transport_mode: ride.transportMode,
		total_persons: ride.totalSeats,
		fare_per_head: ride.pricePerSeat ? String(ride.pricePerSeat) : "0",
		description: ride.description,
		is_female_only: ride.genderPreference === "Female",
		created_by: ride.creator ? {
			full_name: ride.creator.fullName,
			phone_number: ride.creator.phone || "",
			gender: ride.creator.gender || "Others",
			email: ride.creator.email || "",
		} : undefined,
		members: ride.passengers ? ride.passengers.map((p) => ({
			id: p.id,
			email: p.email || "",
			full_name: p.fullName,
			phone_number: p.phone || "",
			gender: p.gender || "Others",
			is_creator: false, // Logic for this might need adjustment if we have creatorId
			pool: Number(ride.id) // Assuming pool id is number for this interface
		})) : [],
		requests: ride.requests ? ride.requests.map((r) => ({
			id: r.id,
			status: r.status,
			userId: r.userId,
			user: r.user ? {
				fullName: r.user.fullName,
				email: r.user.email,
				// Add other fields if needed by Pool interface
			} : undefined
		})) : [],

		// Backend fields for compatibility
		origin: ride.origin,
		destination: ride.destination,
		departureTime: ride.departureTime,
		transportMode: ride.transportMode,
		totalSeats: ride.totalSeats,
		pricePerSeat: ride.pricePerSeat ?? undefined,
		genderPreference: ride.genderPreference,
		creatorId: ride.creatorId,
		creator: ride.creator,
		passengers: ride.passengers,
		group: ride.group,
		// requests is already mapped above but with different structure?
		// The Pool interface has requests as { id, status, userId, user: { fullName, avatar, email } }
		// BackendRequest has user: BackendUser.
		// They seem compatible enough for the user field.
	};
};

/**
 * Pool API Service
 */
export const poolApi = {
	/**
	 * Get all pools
	 */
	getAllPools: async (): Promise<Pool[]> => {
		const rides = await apiRequest<BackendRide[]>("/rides", {}, "Failed to fetch pools");
		return rides.map(mapRideToPool);
	},

	/**
	 * Get pool by ID
	 */
	getPoolById: async (id: string | number): Promise<Pool> => {
		const ride = await apiRequest<BackendRide>(
			`/rides/${id}`,
			{},
			`Failed to fetch pool #${id}`,
		);
		return mapRideToPool(ride);
	},

	/**
	 * Create a new pool
	 */
	createPool: async (poolData: CreatePoolFormValues): Promise<Pool> => {
		const payload = {
			origin: poolData.start_point,
			destination: poolData.end_point,
			departureTime: poolData.departure_time,
			transportMode: poolData.transport_mode,
			totalSeats: Number(poolData.total_persons),
			pricePerSeat: poolData.fare_per_head ? Number(poolData.fare_per_head) : null,
			description: poolData.description,
			genderPreference: poolData.is_female_only ? "Female" : "Any",
		};

		const ride = await apiRequest<BackendRide>(
			"/rides",
			{
				method: "POST",
				body: JSON.stringify(payload),
			},
			"Failed to create pool",
		);
		return mapRideToPool(ride);
	},

	/**
	 * Update a pool (full update)
	 */
	updatePool: async (
		id: string | number,
		poolData: Partial<CreatePoolFormValues>,
	): Promise<Pool> => {
		const payload: Partial<BackendRide> = {};
		if (poolData.start_point) payload.origin = poolData.start_point;
		if (poolData.end_point) payload.destination = poolData.end_point;
		if (poolData.departure_time) payload.departureTime = poolData.departure_time;
		if (poolData.transport_mode) payload.transportMode = poolData.transport_mode;
		if (poolData.total_persons) payload.totalSeats = Number(poolData.total_persons);
		if (poolData.fare_per_head) payload.pricePerSeat = Number(poolData.fare_per_head);
		if (poolData.description) payload.description = poolData.description;
		if (poolData.is_female_only !== undefined) payload.genderPreference = poolData.is_female_only ? "Female" : "Any";

		const ride = await apiRequest<BackendRide>(
			`/rides/${id}`,
			{
				method: "PUT",
				body: JSON.stringify(payload),
			},
			"Failed to update pool",
		);
		return mapRideToPool(ride);
	},

	/**
	 * Partially update a pool
	 */
	patchPool: async (
		id: string | number,
		poolData: Partial<CreatePoolFormValues>,
	): Promise<Pool> => {
		const payload: Partial<BackendRide> = {};
		if (poolData.start_point) payload.origin = poolData.start_point;
		if (poolData.end_point) payload.destination = poolData.end_point;
		if (poolData.departure_time) payload.departureTime = poolData.departure_time;
		if (poolData.transport_mode) payload.transportMode = poolData.transport_mode;
		if (poolData.total_persons) payload.totalSeats = Number(poolData.total_persons);
		if (poolData.fare_per_head) payload.pricePerSeat = Number(poolData.fare_per_head);
		if (poolData.description) payload.description = poolData.description;
		if (poolData.is_female_only !== undefined) payload.genderPreference = poolData.is_female_only ? "Female" : "Any";

		const ride = await apiRequest<BackendRide>(
			`/rides/${id}`,
			{
				method: "PATCH",
				body: JSON.stringify(payload),
			},
			"Failed to update pool",
		);
		return mapRideToPool(ride);
	},

	/**
	 * Delete a pool
	 */
	deletePool: async (id: string | number): Promise<{ message: string }> => {
		return apiRequest<{ message: string }>(
			`/rides/${id}`,
			{
				method: "DELETE",
			},
			"Failed to delete pool",
		);
	},

	/**
	 * Join a pool
	 */
	joinPool: async (id: string | number): Promise<{ message: string }> => {
		return apiRequest<{ message: string }>(
			`/rides/${id}/join`,
			{
				method: "POST",
			},
			"Failed to join pool",
		);
	},

	/**
	 * Leave a pool
	 */
	leavePool: async (id: string | number): Promise<{ message: string }> => {
		return apiRequest<{ message: string }>(
			`/rides/${id}/leave`,
			{
				method: "POST",
			},
			"Failed to leave pool",
		);
	},

	/**
	 * Respond to join request
	 */
	respondToRequest: async (rideId: string, requestId: string, status: "ACCEPTED" | "REJECTED"): Promise<void> => {
		return apiRequest<void>(
			`/rides/${rideId}/requests/${requestId}`,
			{
				method: "PUT",
				body: JSON.stringify({ status })
			},
			"Failed to respond to request"
		);
	}
};
