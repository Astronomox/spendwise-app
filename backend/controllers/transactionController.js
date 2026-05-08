import prisma from "../config/prisma.js";
import { detectCategory } from "../services/categoryDetectionService.js";
import { toNaira } from "../utils/money.js";
import { successResponse } from "../utils/apiResponse.js";
import cacheService from "../services/cache/cacheService.js";
import { invalidateAnalyticsCache } from "../services/analytics/analyticsCacheService.js";

/**
 * Format transaction response
 */
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


// CREATE TRANSACTION
export const createTransaction = async (req, res) => {
    try {
        const { amount, categoryId, description, type } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (amount == null || !type) {
            return res.status(400).json({ message: "Amount and type are required" });
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: "Amount must be a valid positive number" });
        }

        const validTypes = ["EXPENSE", "INCOME"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid transaction type" });
        }

    // Category detection logic
        let finalCategoryId = categoryId;

        if (!finalCategoryId && description) {
            finalCategoryId = await detectCategory(description);
        }

        if (finalCategoryId) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: finalCategoryId },
            });

            if (!categoryExists) {
                finalCategoryId = null;
            }
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                categoryId: finalCategoryId,
                amountKobo: Math.round(Number(amount) * 100),
                type,
                description: description || null,
                transactionDate: new Date(),
            },
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });

        // Invalidate relevant caches
        await cacheService.delPattern(`transactions:${userId}:*`);
        await invalidateAnalyticsCache(userId);

        return res.status(201).json({
            success: true,
            data: formatTransaction(transaction),
        });

    } catch (error) {
        console.error("createTransaction error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


// Get transactions with optional filters and pagination (cached)
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            categoryId,
            category,
            type,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = req.query;

        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNumber - 1) * limitNumber;

        // Cache key for transactions list with filters and pagination
        const cacheKey = `transactions:${userId}:${pageNumber}:${limitNumber}:${categoryId || "all"}:${category || "all"}:${type || "all"}`;

        // Try cache first
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            console.log("Transactions cache HIT");

            return res.json(
                successResponse(cached.data, "Transactions fetched (cached)", {
                    pagination: cached.pagination,
                })
            );
        }

        console.log("Transactions cache MISS");

        // Build filters
        const filters = { userId };

        if (categoryId && category) {
            return res.status(400).json({
                message: "Use either categoryId or category name, not both",
            });
        }

        if (categoryId) {
            filters.categoryId = categoryId;
        }

        if (category) {
            const categoryRecord = await prisma.category.findFirst({
                where: { name: category.trim() },
                select: { id: true },
            });

            if (categoryRecord?.id) {
                filters.categoryId = categoryRecord.id;
            }
        }

        if (type) {
            const validTypes = ["EXPENSE", "INCOME"];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: "Invalid transaction type" });
            }
            filters.type = type;
        }

        if (startDate || endDate) {
            filters.transactionDate = {};

            if (startDate) {
                filters.transactionDate.gte = new Date(startDate);
            }

            if (endDate) {
                filters.transactionDate.lte = new Date(endDate);
            }
        }

        // Hit database to get transactions and total count for pagination
        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: filters,
                orderBy: { transactionDate: "desc" },
                skip,
                take: limitNumber,
                include: {
                    category: {
                        select: { id: true, name: true },
                    },
                },
            }),

            prisma.transaction.count({ where: filters }),
        ]);

        const response = {
            data: transactions.map(formatTransaction),
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        };

        // save to cache
        await cacheService.set(cacheKey, response, 60);

        return res.json(successResponse(
            response.data,
            "Transactions fetched",
            { pagination: response.pagination }
        ));

    } catch (error) {
        console.error("getTransactions error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


// Get a single transaction by ID (cached)
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const cacheKey = `transaction:${userId}:${id}`;

        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return res.json(successResponse(cached, "Transaction fetched (cached)"));
        }

        const transaction = await prisma.transaction.findFirst({
            where: { id, userId },
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const formatted = formatTransaction(transaction);

        await cacheService.set(cacheKey, formatted, 300);

        return res.json(successResponse(formatted, "Transaction fetched"));

    } catch (error) {
        console.error("getTransactionById error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};