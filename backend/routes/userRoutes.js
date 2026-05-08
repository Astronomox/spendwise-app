// routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMe,
  updateProfile,
  updateBudget,
  saveOnboarding,
  exportData,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me",           protect, getMe);
router.put("/profile",      protect, updateProfile);
router.put("/budget",       protect, updateBudget);
router.put("/onboarding",   protect, saveOnboarding);
router.get("/export",       protect, exportData);

export default router;
