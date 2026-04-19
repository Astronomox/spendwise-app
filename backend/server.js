// IMPORTS
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";


// LOAD ENV VARIABLES
dotenv.config();

// INITIALIZE EXPRESS APP
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// GLOBAL MIDDLEWARE AND ROUTE REGISTRATION
app.use(requestLogger); // LOG ALL REQUESTS WITH TIMING AND SLOW REQUEST HIGHLIGHTING
app.use("/api/auth", authRoutes); // AUTH ROUTES
app.use("/api/transactions", transactionRoutes); // TRANSACTION ROUTES
app.use("/api/analytics", analyticsRoutes); // ANALYTICS ROUTES
app.use("/api/auth", authRoutes); //GOOGLE AUTH ROUTES

// HEALTH CHECK ENDPOINT
app.get("/", (req, res) => {
    res.send("SpendWise API running...");
});

// START SERVER
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
