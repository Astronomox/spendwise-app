import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup); // SIGNUP
router.post("/login", login);  // LOGIN

export default router;