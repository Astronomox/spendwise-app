import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAnalytics, getBurnRateController, getSummary } from "../controllers/analyticsController.js";

const router = express.Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get spending analytics
 *     description: Retrieve comprehensive spending analytics for a date range including income, expenses, balance, and breakdown by category
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2024-01-01T00:00:00Z'
 *         description: Start date for analytics period (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2024-01-31T23:59:59Z'
 *         description: End date for analytics period (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsResponse'
 *             example:
 *               success: true
 *               data:
 *                 totalIncome: 150000.00
 *                 totalExpenses: 75000.50
 *                 netBalance: 74999.50
 *                 transactionCount: 45
 *                 byCategory:
 *                   - categoryName: "Groceries"
 *                     totalSpent: 25000.00
 *                     percentage: 33.33
 *                     transactionCount: 12
 *       400:
 *         description: Missing or invalid date parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", protect, getAnalytics);

/**
 * @swagger
 * /api/analytics/burn-rate:
 *   get:
 *     summary: Get burn rate analysis
 *     description: Calculate daily burn rate (average daily spending) over specified number of days with projection for the full month
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *         description: Number of days to analyze (default 30)
 *     responses:
 *       200:
 *         description: Burn rate data calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BurnRateResponse'
 *             example:
 *               success: true
 *               data:
 *                 dailyBurnRate: 2500.50
 *                 projectedMonthlyBurn: 75015.00
 *                 daysAnalyzed: 30
 *                 totalExpenses: 75015.00
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/burn-rate", protect, getBurnRateController);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get financial summary
 *     description: Retrieve a comprehensive financial summary including income, expenses, balance, and category breakdown for a specified date range
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2024-01-01T00:00:00Z'
 *         description: Start date for summary period (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2024-01-31T23:59:59Z'
 *         description: End date for summary period (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsResponse'
 *             example:
 *               success: true
 *               data:
 *                 totalIncome: 150000.00
 *                 totalExpenses: 75000.50
 *                 netBalance: 74999.50
 *                 transactionCount: 45
 *                 byCategory:
 *                   - categoryName: "Groceries"
 *                     totalSpent: 25000.00
 *                     percentage: 33.33
 *                     transactionCount: 12
 *       400:
 *         description: Missing or invalid date parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 

router.get("/summary", protect, getSummary);


export default router;
