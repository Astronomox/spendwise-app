import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAnalytics, getBurnRateController } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", protect, getAnalytics); // ANALYTICS ENDPOINT
router.get("/burn-rate", protect, getBurnRateController); // NEW BURN RATE ENDPOINT

export default router;