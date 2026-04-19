import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { verifyGoogleToken } from "../services/auth/googleAuthService.js";

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// SIGNUP LOGIC
export const signup = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
        where: { email },
        });

        if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                fullName,
            },
    });

    const token = generateToken(user.id);

    res.status(201).json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        token,
    });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIN LOGIC
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
        where: { email },
        });

        if (!user) {
            return res.status(400).json({ message: "Email address not found" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = generateToken(user.id);

        res.json({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GOOGLE LOGIN LOGIC
export const googleAuth = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: "Google ID token is required",
            });
        }

        // 1. Verify Google token
        const googleUser = await verifyGoogleToken(idToken);

        if (!googleUser?.email) {
            return res.status(400).json({
                message: "Invalid Google token",
            });
        }

        // 2. Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        // 3. Create user if not exists
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    fullName: googleUser.fullName,
                    provider: "google",
                    providerId: googleUser.googleId,
                },
            });
        }

        // 4. Generate JWT
        const token = generateToken(user);

        return res.json({
            success: true,
            token,
            user,
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({
            message: "Google authentication failed",
        });
    }
};