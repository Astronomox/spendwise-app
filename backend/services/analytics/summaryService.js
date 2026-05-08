import { getTotalByType } from "./spendingService.js";
import { getCategoryBreakdownByType } from "./categoryService.js";
import { getBurnRate } from "./burnrateService.js";
import { toNaira } from "../../utils/money.js";
import { calculateDailySafeSpend } from "../finance/savingsEngine.js";

// Main function to get analytics summary for a user over a specified date range
export const getAnalyticsSummary = async (userId, startDate, endDate) => {
    const [
        totalExpenses,
        totalIncome,
        expenseCategories,
        incomeCategories,
        burnRate
    ] = await Promise.all([
        getTotalByType(userId, "EXPENSE", startDate, endDate),
        getTotalByType(userId, "INCOME", startDate, endDate),
        getCategoryBreakdownByType(userId, "EXPENSE", startDate, endDate),
        getCategoryBreakdownByType(userId, "INCOME", startDate, endDate),
        getBurnRate(userId, startDate, endDate),
    ]);

    // Calculate net balance
    const netBalance = totalIncome - totalExpenses;

    // Calculate savings plan using the savings engine
    const savings = calculateDailySafeSpend({
        totalIncomeKobo: totalIncome,
        totalExpensesKobo: totalExpenses,
        savingsGoalKobo: 50_000 * 100,
        startDate,
        endDate,
    });

    // Compile and return the analytics summary
    return {
        totalIncomeKobo: totalIncome,
        totalIncomeNaira: toNaira(totalIncome),

        totalExpensesKobo: totalExpenses,
        totalExpensesNaira: toNaira(totalExpenses),

        netBalanceKobo: netBalance,
        netBalanceNaira: toNaira(netBalance),

        burnRate,
        savings,

        expenseBreakdown: expenseCategories,
        incomeBreakdown: incomeCategories,
    };
};