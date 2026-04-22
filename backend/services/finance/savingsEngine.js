import { toNaira } from "../../utils/money.js";

// Function to calculate daily safe spend based on income, expenses, and savings goal
export const calculateDailySafeSpend = ({
    totalIncomeKobo,
    totalExpensesKobo,
    savingsGoalKobo,
    startDate,
    endDate,
    currentDate = new Date(),
}) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date(currentDate);

    const totalDays = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );

    const remainingDays = Math.max(
        1,
        Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    );

    const disposable = totalIncomeKobo - totalExpensesKobo;

    const dailySavingsTarget = savingsGoalKobo / totalDays;

    // how much should already be "reserved" for savings up to today
    const elapsedDays = totalDays - remainingDays;

    const reservedSavings = dailySavingsTarget * elapsedDays;

    const safeSpendPool = disposable - reservedSavings;

    const dailySafeSpend = safeSpendPool / remainingDays;

    return {
        totalDays,
        remainingDays,

        disposableKobo: disposable,
        disposableNaira: toNaira(disposable),

        dailySavingsTargetKobo: dailySavingsTarget,
        dailySavingsTargetNaira: toNaira(dailySavingsTarget),

        reservedSavingsKobo: reservedSavings,
        reservedSavingsNaira: toNaira(reservedSavings),

        safeSpendPoolKobo: safeSpendPool,
        safeSpendPoolNaira: toNaira(safeSpendPool),
        
        dailySafeSpendKobo: dailySafeSpend,
        dailySafeSpendNaira: toNaira(dailySafeSpend),
    };
};