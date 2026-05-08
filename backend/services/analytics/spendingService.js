import prisma from "../../config/prisma.js";
import { safeNumber } from "../../utils/money.js";

// Generic total calculator (income or expense)
export const getTotalByType = async (userId, type, startDate, endDate) => {
    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type,
            transactionDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        _sum: {
            amountKobo: true,
        },
    });

    return safeNumber(result._sum.amountKobo);
};

// Backward compatibility function
export const getTotalSpending = (userId, startDate, endDate) =>
    getTotalByType(userId, "EXPENSE", startDate, endDate);