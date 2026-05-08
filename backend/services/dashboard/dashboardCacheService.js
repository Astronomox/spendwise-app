import cacheService from "../cache/cacheService.js";
import { buildDashboard } from "./dashboardService.js";

const DASHBOARD_TTL = 60;

export const getCachedDashboard = async (userId) => {

    const cacheKey = `dashboard:${userId}`;

    const cached = await cacheService.get(cacheKey);

    if (cached) {
        console.log("⚡ Dashboard cache HIT");
        return cached;
    }

    console.log("🐘 Dashboard cache MISS");

    const dashboard = await buildDashboard(userId);

    await cacheService.set(
        cacheKey,
        dashboard,
        DASHBOARD_TTL
    );

    return dashboard;
};

export const invalidateDashboardCache = async (userId) => {

    await cacheService.del(
        `dashboard:${userId}`
    );
};