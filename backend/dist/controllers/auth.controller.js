"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.login = exports.signup = void 0;
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
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google Token" });
        }
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
        res.status(200).json({ token: jwtToken, user });
    }
    catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: "Google Login Failed", error });
    }
};
exports.googleLogin = googleLogin;
