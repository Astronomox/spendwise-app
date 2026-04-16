import prisma from "../../config/prisma.js";
import { toNaira } from "../../utils/money.js";

export const getCategoryBreakdown = async (userId, startDate, endDate) => {
    const data = await prisma.transaction.groupBy({
        by: ["categoryId"],
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

    if (!data.length) return [];

    const categoryIds = data
        .map((t) => t.categoryId)
        .filter(Boolean);

    const categories = categoryIds.length
        ? await prisma.category.findMany({
            where: { id: { in: categoryIds } },
        })
        : [];

    const map = Object.fromEntries(
        categories.map((c) => [c.id, c.name])
    );

    return data
        .map((item) => {
            const totalKobo = item._sum.amountKobo || 0;

            return {
                category: item.categoryId
                    ? map[item.categoryId] || "Unknown"
                    : "Uncategorized",
                totalKobo,
                totalNaira: toNaira(totalKobo),
            };
        })
        .sort((a, b) => b.totalKobo - a.totalKobo);
};