import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {createTransaction, getTransactions, getTransactionById } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", protect, createTransaction); // Create a new transaction (manual input)
router.get("/", protect, getTransactions); // Get transactions with optional filters: category, type, date range
router.get("/:id", protect, getTransactionById); // Get a single transaction by ID

export default router;