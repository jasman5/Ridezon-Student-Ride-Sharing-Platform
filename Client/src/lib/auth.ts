import { toast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:4000/api";
// const API_BASE_URL = "https://api.ridezon.com";

async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	errorMessage = "An error occurred",
	includeAuthHeader: boolean = true, // 🔧 New flag
): Promise<T> {
	try {
		const accessToken =
			typeof window !== "undefined"
				? sessionStorage.getItem("access")
				: null;

		const headers = {
			"Content-Type": "application/json",
			...(includeAuthHeader && accessToken
				? { Authorization: `Bearer ${accessToken}` }
				: {}),
			...options.headers,
		};

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const message = errorData.detail ?? errorData.message ?? errorMessage;
			console.error(`API Error (${response.status}):`, message, errorData);
			throw new Error(errorData.error);
		}

		const data = await response.json();
		return data as T;
	} catch (error) {
		console.error("API Request Error:", error);

		toast({
			title: "Error",
			description: error instanceof Error ? error.message : String(error),
			variant: "destructive",
		});

		throw error;
	}
}

interface GoogleAuthResponse {
	access: string;
	refresh: string;
	user?: {
		email: string;
		full_name: string;
		phone_number?: string;
		gender?: string;
	};
}

interface GoogleSignUp {
	message: string;
	email: string;
	name: string;
	temp_token: string;
}

interface SignupData {
	access_token: string;
	phone_number: string;
	gender: string;
}

export interface CurrentUserDetailsProps {
	id: string;
	email: string;
	full_name: string;
	phone_number: string;
	gender: string;
}

/**
 * Authentication API Service
 */
export const authApi = {
	/**
	 * Login with Google
	 */
	googleLogin: async (accessToken: string): Promise<GoogleAuthResponse> => {
		return apiRequest<GoogleAuthResponse>(
			"/auth/google/",
			{
				method: "POST",
				body: JSON.stringify({
					access_token: accessToken,
					signup_intent: false,
				}),
			},
			"Failed to login with Google",
			false, // ❌ No Authorization header
		);
	},

	/**
	 * Get user info from Google token
	 */
	getGoogleSignUp: async (accessToken: string): Promise<GoogleSignUp> => {
		return apiRequest<GoogleSignUp>(
			"/auth/google/",
			{
				method: "POST",
				body: JSON.stringify({
					access_token: accessToken,
					signup_intent: true,
				}),
			},
			"Failed to get user info from Google",
			false,
		);
	},

	/**
	 * Complete signup with additional user details
	 */
	completeSignup: async (data: SignupData): Promise<GoogleAuthResponse> => {
		return apiRequest<GoogleAuthResponse>(
			"/auth/user/register-info/",
			{
				method: "PUT",
				body: JSON.stringify(data),
				headers: {
					Authorization: `Bearer ${data.access_token}`,
				},
			},
			"Failed to complete signup",
		);
	},

	/**
	 * Fetch current logged-in user details
	 */
	getCurrentUser: async (): Promise<CurrentUserDetailsProps> => {
		return apiRequest<CurrentUserDetailsProps>(
			"/auth/user/profile",
			{
				method: "GET",
			},
			"Failed to fetch current user details",
		);
	},

	/**
	 * Logout user
	 */
	logout: async (): Promise<void> => {
		try {
			// Get tokens from local storage
			const refreshToken = sessionStorage.getItem("refresh");

			if (refreshToken) {
				// Make logout API request
				await apiRequest<void>(
					"/auth/logout/",
					{
						method: "POST",
						body: JSON.stringify({
							refresh_token: refreshToken,
						}),
					},
					"Failed to logout",
				);
			}
		} catch (error) {
			console.error("Logout Error:", error);
			// We don't throw here to ensure client-side logout always completes
			toast({
				title: "Logout Warning",
				description: "Logged out locally, but server session might persist.",
				variant: "default",
			});
		} finally {
			// Always clear local session
			sessionStorage.removeItem("access");
			sessionStorage.removeItem("refresh");
			sessionStorage.removeItem("user");
		}
	},
};
