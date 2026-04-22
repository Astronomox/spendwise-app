import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ingestSMS } from "../controllers/smsController.js";

const router = express.Router();

/**
 * @swagger
 * /sms/ingest:
 *   post:
 *     summary: Ingest SMS message to create transaction
 *     description: Parses SMS message, auto-detects category and transaction type (INCOME/EXPENSE based on keywords like 'credit'), creates transaction record. Requires authentication.
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SMSIngestInput'
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * components:
 *   schemas:
 *     SMSIngestInput:
 *       type: object
 *       required: [message]
 *       properties:
 *         message:
 *           type: string
 *           example: "Credit alert: N5000 received from XYZ"
 *           description: Raw SMS message text for parsing
 */
router.post("/ingest", protect, ingestSMS);

export default router;