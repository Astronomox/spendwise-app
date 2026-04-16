import prisma from "../../config/prisma.js";
import { safeNumber, toNaira } from "./analyticsUtils.js";

export const getBurnRate = async (userId, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, count] = await Promise.all([
        prisma.transaction.aggregate({
            where: {
                userId,
                type: "EXPENSE",
                transactionDate: {
                    gte: startDate,
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
                },
            },
        }),
    ]);

    const totalSpent = safeNumber(total._sum.amountKobo);

    return {
        totalSpentKobo: totalSpent,
        totalSpentNaira: toNaira(totalSpent),
        dailyAverageKobo: totalSpent / days,
        dailyAverageNaira: toNaira(totalSpent / days),
        avgPerTransaction: count ? totalSpent / count : 0,
    };
};