// routes/goalsRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addDeposit,
} from "../controllers/goalsController.js";

const router = express.Router();

router.get("/",       protect, getGoals);
router.get("/:id",    protect, getGoalById);
router.post("/",      protect, createGoal);
router.put("/:id",    protect, updateGoal);
router.delete("/:id", protect, deleteGoal);
router.post("/:id/deposit", protect, addDeposit);

export default router;
