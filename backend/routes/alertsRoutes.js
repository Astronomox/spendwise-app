// routes/alertsRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAlerts,
  markRead,
  markAllRead,
  clearAlerts,
} from "../controllers/alertsController.js";

const router = express.Router();

router.get("/",              protect, getAlerts);
router.put("/:id/read",      protect, markRead);
router.put("/read-all",      protect, markAllRead);
router.delete("/",           protect, clearAlerts);

export default router;
