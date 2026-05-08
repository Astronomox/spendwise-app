import prisma from "../../config/prisma.js";
import { safeNumber, toNaira } from "../../utils/money.js";

// Get burn rate analytics for a user over a specified date range
export const getBurnRate = async (userId, startDate, endDate) => {
    const [agg, count] = await Promise.all([
        prisma.transaction.aggregate({
            where: {
                userId,
                type: "EXPENSE",
                transactionDate: { gte: startDate, lte: endDate },
            },
            _sum: { amountKobo: true },
        }),

        prisma.transaction.count({
            where: {
                userId,
                type: "EXPENSE",
                transactionDate: { gte: startDate, lte: endDate },
            },
        }),
    ]);

    const totalSpent = safeNumber(agg._sum.amountKobo);

    const days = Math.max(
        1,
        Math.ceil((endDate - startDate) / 86400000)
    );

    const dailyAverage = totalSpent / days;

    return {
        totalSpentKobo: totalSpent,
        totalSpentNaira: toNaira(totalSpent),

        dailyAverageKobo: dailyAverage,
        dailyAverageNaira: toNaira(dailyAverage),
        
        avgPerTransaction: count ? totalSpent / count : 0,
        days,
    };
};