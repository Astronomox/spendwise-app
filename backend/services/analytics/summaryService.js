import { getTotalSpending } from "./spendingService.js";
import { getTotalIncome } from "./incomeService.js";
import { getCategoryBreakdownByType } from "./categoryService.js";
import { getBurnRate } from "./burnrateService.js";
import { toNaira } from "../../utils/money.js";
import { calculateDailySafeSpend } from "../finance/savingsEngine.js";

export const getAnalyticsSummary = async (userId, startDate, endDate) => {
    const [
        totalExpenses,
        totalIncome,
        expenseCategories,
        incomeCategories,
        burnRate
    ] = await Promise.all([
        getTotalSpending(userId, startDate, endDate),
        getTotalIncome(userId, startDate, endDate),
        getCategoryBreakdownByType(userId, "EXPENSE", startDate, endDate),
        getCategoryBreakdownByType(userId, "INCOME", startDate, endDate),
        getBurnRate(userId, startDate, endDate)    ]);

    const savings = calculateDailySafeSpend({
        totalIncomeKobo: totalIncome,
        totalExpensesKobo: totalExpenses,
        savingsGoalKobo: 50000 * 100, // TEMP (later from DB)
        startDate,
        endDate,
    });

    const netBalance = totalIncome - totalExpenses;

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