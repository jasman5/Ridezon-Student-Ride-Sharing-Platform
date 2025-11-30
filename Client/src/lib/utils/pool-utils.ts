import type { Pool } from "@/types/pool";

/**
 * Calculates fare per head for a pool
 * @param pool - Pool object
 * @returns Fare per head as a number
 */
export const calculateFarePerHead = (pool: Pool): number => {
	// If fare_per_head is directly available, parse it
	if (pool.fare_per_head) {
		return Number.parseFloat(pool.fare_per_head);
	}

	// Otherwise calculate from totalFare and totalPersons
	const totalPersons = pool.total_persons ?? pool.totalPersons ?? 1;
	const totalFare = pool.totalFare ?? 0;

	return totalFare / totalPersons;
};

/**
 * Formats fare per head for display
 * @param pool - Pool object
 * @returns Formatted fare per head string
 */
export const formatFarePerHead = (pool: Pool): string => {
	// If fare_per_head is directly available, return it
	if (pool.fare_per_head) {
		return pool.fare_per_head;
	}

	// Otherwise calculate and format
	return calculateFarePerHead(pool).toFixed(2);
};

/**
 * Calculates and formats fare per head from total fare and total persons
 * @param totalFare - Total fare
 * @param totalPersons - Total persons
 * @returns Formatted fare per head string
 */
export const calculateFormattedFarePerHead = (
	totalFare: number,
	totalPersons: number,
): number => {
	if (totalPersons <= 0) return 0.0;
	return Number.parseFloat((totalFare / totalPersons).toFixed(2));
};

/**
 * Formats a date string for datetime-local input (YYYY-MM-DDThh:mm)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDateForInput = (dateString: string | undefined): string => {
	if (!dateString) return "";
	try {
		const date = new Date(dateString);
		// Check if date is valid
		if (isNaN(date.getTime())) return "";

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");

		return `${year}-${month}-${day}T${hours}:${minutes}`;
	} catch (e) {
		return "";
	}
};
