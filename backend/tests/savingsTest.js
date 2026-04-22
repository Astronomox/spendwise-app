import { calculateDailySafeSpend } from "../services/finance/savingsEngine.js";

const result = calculateDailySafeSpend({
    totalIncomeKobo: 15000000,
    totalExpensesKobo: 4000000,
    savingsGoalKobo: 2000000,
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    currentDate: "2026-01-15",
});
console.log(result);