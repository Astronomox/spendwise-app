import { calculateDailySafeSpend } from "../services/finance/savingsEngine.js";
import { getAnalyticsSummary } from "../services/analytics/summaryService.js";

export const getSavingsPlan = async (req, res) => {
    try {
        const userId = req.user.id;

        const { startDate, endDate } = req.query;

        const summary = await getAnalyticsSummary(
            userId,
            new Date(startDate),
            new Date(endDate)
        );

        const result = calculateDailySafeSpend({
            totalIncomeKobo: summary.totalIncomeKobo,
            totalExpensesKobo: summary.totalExpensesKobo,
            savingsGoalKobo: 2000000, // temporary goal
            startDate,
            endDate,
        });

        return res.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error("Savings Error:", error);
        return res.status(500).json({
            message: "Failed to calculate savings plan",
        });
    }
};