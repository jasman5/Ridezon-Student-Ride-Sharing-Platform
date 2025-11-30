"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSignupSchema = exports.logoutSchema = exports.googleLoginSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits"),
        gender: zod_1.z.enum(["Male", "Female", "Others"]),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
exports.googleLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        access_token: zod_1.z.string().min(1, "Token is required"),
    }),
});
exports.logoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        refresh_token: zod_1.z.string().min(1, "Refresh token is required"),
    }),
});
exports.completeSignupSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone_number: zod_1.z.string().min(10, "Phone number must be at least 10 digits"),
        gender: zod_1.z.enum(["Male", "Female", "Others"]),
    }),
});
