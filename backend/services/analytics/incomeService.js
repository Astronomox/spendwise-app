import prisma from "../../config/prisma.js";
import { safeNumber } from "../../utils/money.js";

export const getTotalIncome = async (userId, startDate, endDate) => {
    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: "INCOME",
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