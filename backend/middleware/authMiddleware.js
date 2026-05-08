import jwt from "jsonwebtoken";

// Global middleware to protect routes
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach JWT payload directly
        req.user = {
            id: decoded.id,
            email: decoded.email,
            fullName: decoded.fullName,
            provider: decoded.provider,
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token invalid",
        });
    }
};