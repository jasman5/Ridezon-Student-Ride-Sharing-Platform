import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        gender: z.enum(["Male", "Female", "Others"]),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const googleLoginSchema = z.object({
    body: z.object({
        access_token: z.string().min(1, "Token is required"),
    }),
});

export const logoutSchema = z.object({
    body: z.object({
        refresh_token: z.string().min(1, "Refresh token is required"),
    }),
});

export const completeSignupSchema = z.object({
    body: z.object({
        phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
        gender: z.enum(["Male", "Female", "Others"]),
    }),
});
