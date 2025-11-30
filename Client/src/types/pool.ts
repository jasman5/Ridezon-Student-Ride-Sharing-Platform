// Define the pool type

export interface PoolMembers {
	id?: string;
	full_name: string;
	phone_number: string | number;
	gender: "Male" | "Female" | "Others";
	is_creator: boolean;
	pool: number;
	email?: string;
}

export interface Pool {
	id: string | number;
	// Backend fields
	origin?: string;
	destination?: string;
	departureTime?: string;
	transportMode?: string;
	totalSeats?: number;
	pricePerSeat?: number;
	description?: string;
	genderPreference?: string;
	creatorId?: string;
	creator?: {
		fullName: string;
		avatar?: string;
		phone?: string;
		gender?: string;
		email?: string; // Added for compatibility check
	};
	passengers?: {
		id?: string;
		fullName: string;
		avatar?: string;
		phone?: string;
		gender?: string;
	}[];
	requests?: {
		id: string;
		status: "PENDING" | "ACCEPTED" | "REJECTED";
		userId: string;
		user?: {
			fullName: string;
			avatar?: string;
			email?: string;
		};
	}[];
	group?: {
		id: string;
	};

	// Legacy fields (keep for now if used elsewhere, but mark optional)
	created_by?: {
		full_name: string;
		phone_number: string;
		gender: string;
		email: string;
	};
	createdBy?: string;
	members?: PoolMembers[];
	start_point?: string;
	startPoint?: string;
	end_point?: string;
	endPoint?: string;
	departure_time?: string;
	arrival_time?: string;
	arrivalTime?: string;
	transport_mode?: string;
	total_persons?: number;
	totalPersons?: number;
	current_persons?: number;
	currentPersons?: number;
	fare_per_head?: string;
	totalFare?: number;
	is_female_only?: boolean;
	femaleOnly?: boolean;
}

export interface FilterState {
	searchQuery: string;
	femaleOnlyFilter: boolean | null;
	startPointFilter: string | null;
	endPointFilter: string | null;
	transportModeFilter: string | null;
	departureTimeFilter: string | null;
	fareRange: [number, number];
}

export interface CreatePoolFormData {
	startPoint: string;
	endPoint: string;
	departureTime: string;
	arrivalTime: string;
	transportMode: string;
	totalPersons: number;
	currentPersons: number;
	totalFare: number;
	description: string;
	femaleOnly: boolean;
}

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	image?: string;
	gender?: "Male" | "Female" | "Others";
}
