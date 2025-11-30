import type { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		user: {
			/** The user's id. */
			id?: string;
		} & DefaultSession["user"];
	}
}
