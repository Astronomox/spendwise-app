import { getSavingsPlan } from "../controllers/savingsController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/savings/plan:
 *   get:
 *     summary: Get personalized savings plan
 *     description: Calculate a daily safe spend amount based on user's income, expenses, and a predefined savings goal for a specified date range. Requires authentication.
 *     tags: [Savings]
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
 *         description: Start date for savings plan period (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2024-01-31T23:59:59Z'
 *         description: End date for savings plan period (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Savings plan calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDays:
 *                       type: integer
 *                       example: 30
 *                     remainingDays:
 *                       type: integer
 *                       example: 15
 *                     disposableKobo:
 *                       type: integer
 *                       example: 11000000
 *                     disposableNaira:
 *                       type: number
 *                       format: float
 *                       example: 110000.00
 *                     dailySavingsTargetKobo:
 *                       type: integer
 *                       example: 666666
 *                     dailySavingsTargetNaira:
 *                       type: number
 *                       format: float
 *                       example: 6666.66
 *                     reservedSavingsKobo:
 *                       type: integer
 *                       example: 3333333
 *                     reservedSavingsNaira:
 *                       type: number
 *                       format: float
 *                       example: 33333.33
 *                     safeSpendPoolKobo:
 *                       type: integer
 *                       example: 7666667
 *                     safeSpendPoolNaira:
 *                       type: number
 *                       format: float
 *                       example: 76666.67
 *                     dailySafeSpendKobo:
 *                       type: integer
 *                       example: 511111
 *                     dailySafeSpendNaira:
 *                       type: number
 *                       format: float
 *                       example: 5111.11
 *       500:
 *         description: Failed to calculate savings plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/plan", protect, getSavingsPlan);

export default router;