import prisma from "../config/prisma.js";

// Create a new transaction (manual input)
export const createTransaction = async (req, res) => {
    try {
        const { amount, categoryId, description, type } = req.body;

        if (!amount || !type) {
            return res.status(400).json({ message: "Amount and type are required" });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                categoryId,
                amountKobo: amount * 100, // convert to kobo
                type,
                description,
            },
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
    };


// Get transactions with optional filters: category, type, date range, combined filters, and pagination
export const getTransactions = async (req, res) => {
    try {
        const {
            categoryId,
            type,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = req.query;

        const filters = {
            userId: req.user.id,
            };

            // category (by ID)
            if (categoryId) {
                filters.categoryId = categoryId;
            }

            // category (by NAME)
            if (req.query.category) {
                filters.category = {
                    is: {
                    name: req.query.category,
                    },
            };
            }

            // type
            if (type) {
                filters.type = type;
            }

            // date range
            if (startDate || endDate) {
                filters.transactionDate = {};

            if (startDate && !isNaN(new Date(startDate))) {
                filters.transactionDate.gte = new Date(startDate);
            }

            if (endDate && !isNaN(new Date(endDate))) {
                filters.transactionDate.lte = new Date(endDate);
            }
            }

        // pagination (IMPORTANT FIX)
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const transactions = await prisma.transaction.findMany({
            where: filters,
            orderBy: {
                transactionDate: "desc",
            },
            skip,
            take,
            include: {
                category: true,
            },
        });

        // optional: total count for frontend pagination
        const total = await prisma.transaction.count({
            where: filters,
        });

        res.json({
            data: transactions,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
        },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

