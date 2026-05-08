// IMPORTS
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/redis.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { responseTimeMiddleware } from "./middleware/responseTime.js";
import { setupSwagger } from "./swagger.js";
import compression from "compression";
import rateLimit from "express-rate-limit";



// LOAD ENV VARIABLES
dotenv.config();

// INITIALIZE EXPRESS APP
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(compression());

app.use(
    rateLimit({
        windowMs: 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.use(responseTimeMiddleware);
app.use(requestLogger);
// ROUTES
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import savingsRoutes from "./routes/savingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Route registration
app.use("/api/auth", authRoutes); // AUTH ROUTES
app.use("/api/transactions", transactionRoutes); // TRANSACTION ROUTES
app.use("/api/analytics", analyticsRoutes); // ANALYTICS ROUTES
app.use("/api/sms", smsRoutes); // SMS INGESTION ROUTES
app.use("/api/savings", savingsRoutes); // SAVINGS PLAN ROUTES
app.use("/api/dashboard", dashboardRoutes); // DASHBOARD ROUTES

if (process.env.NODE_ENV !== "production") {
    setupSwagger(app); // Setup Swagger documentation
}

// HEALTH CHECK ENDPOINT
app.get("/", (req, res) => {
    res.send("SpendWise API running...");
});

// START SERVER
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
