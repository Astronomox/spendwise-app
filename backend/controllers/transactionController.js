import prisma from "../config/prisma.js";
import { detectCategory } from "../services/categoryDetectionService.js";
import { toNaira } from "../utils/money.js";
import { successResponse } from "../utils/apiResponse.js";

// Helper to format transaction response
const formatTransaction = (tx) => ({
    id: tx.id,
    userId: tx.userId,

    amountKobo: tx.amountKobo,
    amountNaira: toNaira(tx.amountKobo),

    type: tx.type,
    description: tx.description,

    transactionDate: tx.transactionDate,
    createdAt: tx.createdAt,

    categoryId: tx.categoryId,
    categoryName: tx.category?.name || "Uncategorized",
});


// Create a new transaction
export const createTransaction = async (req, res) => {
    try {
        const { amount, categoryId, description, type } = req.body;

        if (amount == null || !type) {
            return res.status(400).json({
                message: "Amount and type are required",
            });
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be a valid positive number",
            });
        }

        const validTypes = ["EXPENSE", "INCOME"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid transaction type",
            });
        }

        // Validate category ownership (if provided manually)
        if (categoryId) {
            const categoryExists = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    OR: [
                        { userId: req.user.id },
                        { userId: null },
                    ],
                },
            });

            if (!categoryExists) {
                return res.status(400).json({
                    message: "Invalid categoryId",
                });
            }
        }

        let finalCategoryId = categoryId;

        // Auto-detect category ONLY if not provided
        if (!finalCategoryId && description) {
            const detected = await detectCategory(description);
            finalCategoryId = detected || null;
        }

        // Validate detected category (important fix)
        if (finalCategoryId) {
            const categoryExists = await prisma.category.findFirst({
                where: {
                    id: finalCategoryId,
                    OR: [
                        { userId: req.user.id },
                        { userId: null },
                    ],
                },
            });

            if (!categoryExists) {
                finalCategoryId = null; // fallback instead of failing request
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                categoryId: finalCategoryId,
                amountKobo: Math.round(Number(amount) * 100),
                type,
                description: description || null,
                transactionDate: new Date(),
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
    },
}
        });

        res.status(201).json({
            success: true,
            data: formatTransaction(transaction),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};


// Get transactions (with filters + pagination)
export const getTransactions = async (req, res) => {
    try {
        const {
            categoryId,
            category,
            type,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = req.query;

        const filters = {
            userId: req.user.id,
        };

        if (categoryId && category) {
            return res.status(400).json({
                message: "Use either categoryId or category name, not both",
            });
        }

        if (categoryId) {
            filters.categoryId = categoryId;
        }

        // FIX: safer category name filtering
        if (category) {
            const categoryRecord = await prisma.category.findFirst({
                where: { name: category.trim() },
                select: { id: true },
        });
        
        filters.categoryId = categoryRecord?.id;
    }

        if (type) {
            const validTypes = ["EXPENSE", "INCOME"];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    message: "Invalid transaction type",
                });
            }
            filters.type = type;
        }

        if (startDate || endDate) {
            filters.transactionDate = {};

            if (startDate) {
                const parsedStart = new Date(startDate);
                if (isNaN(parsedStart.getTime())) {
                    return res.status(400).json({
                        message: "Invalid startDate",
                    });
                }
                filters.transactionDate.gte = parsedStart;
            }

            if (endDate) {
                const parsedEnd = new Date(endDate);
                if (isNaN(parsedEnd.getTime())) {
                    return res.status(400).json({
                        message: "Invalid endDate",
                    });
                }
                filters.transactionDate.lte = parsedEnd;
            }
        }

        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.min(50, Math.max(1, Number(limit)));

        const skip = (pageNumber - 1) * limitNumber;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: filters,
                orderBy: {
                    transactionDate: "desc",
                },
                skip,
                take: limitNumber,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                }
            }),

            prisma.transaction.count({
                where: filters,
            }),
        ]);

        res.json(successResponse(
            transactions.map(formatTransaction),
            "Transactions fetched",
            {
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                }
            }
));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};


// Get a single transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
    },
}
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found",
            });
        }

        res.json(successResponse(
            formatTransaction(transaction),
            "Transaction fetched"
        ));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};