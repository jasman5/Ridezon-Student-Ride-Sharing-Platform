"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSignup = exports.logout = exports.getProfile = exports.googleLogin = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const signup = async (req, res) => {
    try {
        const { fullName, email, password, phone, gender } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                phone,
                gender,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });
        res.status(201).json({ token, user });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.password)
            return res.status(400).json({ message: "Please login with Google" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });
        res.status(200).json({ token, user });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};
exports.login = login;
const googleLogin = async (req, res) => {
    try {
        const { access_token, signup_intent } = req.body;
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        if (!response.ok) {
            return res.status(400).json({ message: "Invalid Google Token" });
        }
        const payload = await response.json();
        const { email, name, picture } = payload;
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    fullName: name || "Unknown",
                    avatar: picture,
                },
            });
        }
        const jwtToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
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
    }
    catch (error) {
        console.error("Google Login Error Details:", JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error("Error Message:", error.message);
            console.error("Error Stack:", error.stack);
        }
        res.status(500).json({ message: "Google Login Failed", error: error instanceof Error ? error.message : error });
    }
};
exports.googleLogin = googleLogin;
const getProfile = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", error });
    }
};
exports.getProfile = getProfile;
const logout = async (req, res) => {
    try {
        // In a stateless JWT system, we might not do anything here unless we have a blacklist.
        // For now, just return success.
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Logout failed", error });
    }
};
exports.logout = logout;
const completeSignup = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { phone_number, gender } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                phone: phone_number,
                gender,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", {
            expiresIn: "7d",
        });
        res.status(200).json({
            message: "Profile updated",
            user,
            access: token,
            refresh: token
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update profile", error });
    }
};
exports.completeSignup = completeSignup;
