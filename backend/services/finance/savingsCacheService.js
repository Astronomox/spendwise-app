import cacheService from "../cache/cacheService.js";
import { calculateDailySafeSpend } from "./savingsEngine.js";

const SAVINGS_TTL = 60;

// Get cached safe spend calculation for a user
export const getCachedSafeSpend = async (userId) => {
    const cacheKey = `savings:safespend:${userId}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
        console.log("Savings cache HIT");
        return cached;
    }

    console.log("Savings cache MISS");

    const data = await calculateDailySafeSpend(userId);

    await cacheService.set(cacheKey, data, SAVINGS_TTL);

    return data;
};

// Invalidate savings cache for a user (called after transaction changes)
export const invalidateSavingsCache = async (userId) => {
    await cacheService.del(`savings:safespend:${userId}`);
};