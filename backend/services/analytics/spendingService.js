import prisma from "../../config/prisma.js";
import { safeNumber } from "../../utils/money.js";

export const getTotalSpending = async (userId, startDate, endDate) => {
    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: "EXPENSE",
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