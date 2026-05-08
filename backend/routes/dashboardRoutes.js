import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Fetch cached dashboard metrics for the authenticated user (balance, spending, safe spend, and recent transactions).
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: object
 *                       properties:
 *                         currentBalanceKobo:
 *                           type: integer
 *                         currentBalanceNaira:
 *                           type: number
 *                           format: double
 *                     spending:
 *                       type: object
 *                       properties:
 *                         totalIncomeKobo:
 *                           type: integer
 *                         totalExpensesKobo:
 *                           type: integer
 *                     safeSpend:
 *                       type: object
 *                       properties:
 *                         dailySafeSpendKobo:
 *                           type: integer
 *                         dailySafeSpendNaira:
 *                           type: number
 *                           format: double
 *                     recentTransactions:
 *                       type: array
 *             example:
 *               success: true
 *               data:
 *                 balance:
 *                   currentBalanceKobo: 120000
 *                   currentBalanceNaira: 1200
 *                 spending:
 *                   totalIncomeKobo: 200000
 *                   totalExpensesKobo: 80000
 *                 safeSpend:
 *                   dailySafeSpendKobo: 5000
 *                   dailySafeSpendNaira: 50
 *                 recentTransactions: []
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", protect, getDashboard);

export default router;

