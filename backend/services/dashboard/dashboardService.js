import prisma from "../../config/prisma.js";
import cacheService from "../cache/cacheService.js";
import { toNaira } from "../../utils/money.js";
import { calculateDailySafeSpend } from "../finance/savingsEngine.js";

const DASHBOARD_TTL = 60; // Cache dashboard data for 60 seconds

// Get dashboard data with caching
export const getDashboardData = async (userId) => {
    const cacheKey = `dashboard:${userId}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
        console.log("Dashboard cache HIT");
        return cached;
    }

    console.log("Dashboard cache MISS");

    // Fetch transactions to calculate balance, spending, and recent activity
    const transactions = await prisma.transaction.findMany({
        where: { userId },
        select: {
            amountKobo: true,
            type: true,
            transactionDate: true,
            category: true,
        },
    });

    let income = 0;
    let expenses = 0;

    for (const tx of transactions) {
        if (tx.type === "INCOME") income += tx.amountKobo;
        else expenses += tx.amountKobo;
    }

    const balance = income - expenses;

    const recentTransactions = transactions
        .slice()
        .sort((a, b) => b.transactionDate - a.transactionDate)
        .slice(0, 5);

    // Calculate safe spend using the savings engine
    const savingsPlan = calculateDailySafeSpend({
        totalIncomeKobo: income,
        totalExpensesKobo: expenses,
        savingsGoalKobo: 50_000_000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
    });

    // Compile dashboard payload
    const payload = {
        balance: {
            currentBalanceKobo: balance,
            currentBalanceNaira: balance.toNaira(),
        },
        spending: {
            totalIncomeKobo: income,
            totalIncomeNaira: income.toNaira(),

            totalExpensesKobo: expenses,
            totalExpensesNaira: expenses.toNaira(),

        },
        safeSpend: {
            dailySafeSpendKobo: savingsPlan.dailySafeSpend,
            dailySafeSpendNaira: savingsPlan.dailySafeSpend.toNaira(),
        },
        recentTransactions,
    };

    // Cache the dashboard data for future requests
    await cacheService.set(cacheKey, payload, DASHBOARD_TTL);

    return payload;
};