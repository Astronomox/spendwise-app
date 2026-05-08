import cacheService from "../cache/cacheService.js";
import { getAnalyticsSummary } from "./summaryService.js";

const SUMMARY_TTL = 120;

// Get cached analytics summary for a user within a date range
export const getCachedAnalyticsSummary = async (userId, startDate, endDate) => {
    const cacheKey = `analytics:summary:${userId}:${startDate || "all"}:${endDate || "all"}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
        console.log("Analytics cache HIT");
        return cached;
    }

    console.log("Analytics cache MISS");

    const summary = await getAnalyticsSummary(userId, startDate, endDate);

    await cacheService.set(cacheKey, summary, SUMMARY_TTL);

    return summary;
};

// INVALIDATION STRATEGY
export const invalidateAnalyticsCache = async (userId) => {
    await cacheService.delPattern(`analytics:*:${userId}:*`);
    await cacheService.del(`dashboard:${userId}`);
};