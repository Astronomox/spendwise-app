// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { setupSwagger } from "./swagger.js";

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
import smsRoutes from "./routes/smsRoutes.js";
import savingsRoutes from "./routes/savingsRoutes.js";
import goalsRoutes from "./routes/goalsRoutes.js";
import alertsRoutes from "./routes/alertsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// GLOBAL MIDDLEWARE AND ROUTE REGISTRATION
app.use(requestLogger);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/users", userRoutes);
setupSwagger(app);

// HEALTH CHECK ENDPOINT
app.get("/", (req, res) => {
    res.send("SpendWise API running...");
});

// START SERVER
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
