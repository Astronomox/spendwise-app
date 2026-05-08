import prisma from "../config/prisma.js";
import { parseBankSMS } from "../services/sms/smsParser.js";
import { detectCategoryFromText } from "../services/merchant/merchantService.js";

export const ingestSMS = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                message: "Valid SMS message is required",
            });
        }
        
        const existing = await prisma.transaction.findFirst({
            where: {
                userId,
                description: message,
            },
        });

        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Duplicate transaction ignored",
                transaction: existing,
            });
        }
        // Parse SMS
        const parsed = parseBankSMS(message);

        // Detect category
        const category = await detectCategoryFromText(
            (parsed.rawText + " " + parsed.merchant).toLowerCase()
        );

        // Save
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                amountKobo: parsed.amountKobo,
                type: parsed.type,
                description: message,
                categoryId: category?.id,
                transactionDate: parsed.transactionDate,
            },
        });

        res.json({
            success: true,
            parsed,
            transaction,
        });

    } catch (error) {
        console.error("SMS Error:", error);
        res.status(500).json({ message: "SMS ingestion failed" });
    }
};