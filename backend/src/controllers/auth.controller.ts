import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export const signup = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, phone, gender } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                phone,
                gender,
            },
        });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.password) return res.status(400).json({ message: "Please login with Google" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { access_token, signup_intent } = req.body;

        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);

        if (!response.ok) {
            return res.status(400).json({ message: "Invalid Google Token" });
        }

        const payload = await response.json();
        const { email, name, picture } = payload;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    fullName: name || "Unknown",
                    avatar: picture,
                },
            });
        }

        const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });

        if (signup_intent) {
            return res.status(200).json({
                message: "Google info retrieved",
                email: user.email,
                name: user.fullName,
                temp_token: jwtToken,
            });
        }

        res.status(200).json({
            access: jwtToken,
            refresh: jwtToken,
            user: {
                ...user,
                full_name: user.fullName,
            }
        });
    } catch (error) {
        console.error("Google Login Error Details:", JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error("Error Message:", error.message);
            console.error("Error Stack:", error.stack);
        }
        res.status(500).json({ message: "Google Login Failed", error: error instanceof Error ? error.message : error });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", error });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        // In a stateless JWT system, we might not do anything here unless we have a blacklist.
        // For now, just return success.
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed", error });
    }
};

export const completeSignup = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { phone_number, gender } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                phone: phone_number,
                gender,
            },
        });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });

        res.status(200).json({
            message: "Profile updated",
            user,
            access: token,
            refresh: token
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error });
    }
};
