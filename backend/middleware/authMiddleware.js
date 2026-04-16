import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
        token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;

        next();
        } catch (err) {
            return res.status(401).json({ message: "Token invalid" });
        }
    } else {
        return res.status(401).json({ message: "No token provided" });
    }
};