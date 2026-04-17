import { getTotalSpending } from "./spendingService.js";
import { getCategoryBreakdown } from "./categoryService.js";
import { calculateDays } from "./analyticsUtils.js";
import { safeNumber, toNaira } from "../../utils/money.js";

// Main function to get comprehensive spending analytics for a user over a specified date range
export const getSpendingAnalytics = async (userId, startDate, endDate) => {
    const [total, categories] = await Promise.all([
        getTotalSpending(userId, startDate, endDate),
        getCategoryBreakdown(userId, startDate, endDate),
    ]);

    const days = calculateDays(startDate, endDate);

    const safeTotal = safeNumber(total);

    const dailyAvg = total / days;

    return {
        totalSpentKobo: safeTotal,
        totalSpentNaira: toNaira(safeTotal),
        categoryBreakdown: categories,
        dailyAverageKobo: Math.round(dailyAvg),
        dailyAverageNaira: Number((dailyAvg / 100).toFixed(2)),
    };
};