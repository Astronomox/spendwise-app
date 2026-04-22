import prisma from "../../config/prisma.js";
import { safeNumber, toNaira } from "../../utils/money.js";

// Burn rate = average daily spending between two dates
export const getBurnRate = async (userId, startDate, endDate) => {
    const [total, count] = await Promise.all([
        prisma.transaction.aggregate({
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
        }),

        prisma.transaction.count({
            where: {
                userId,
                type: "EXPENSE",
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        }),
    ]);

    const days = Math.max(
        1,
        Math.ceil(
            (new Date(endDate) - new Date(startDate)) /
            (1000 * 60 * 60 * 24)
        )
    );

    const totalSpent = safeNumber(total._sum.amountKobo);

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