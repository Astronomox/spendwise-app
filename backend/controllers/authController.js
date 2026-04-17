import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

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