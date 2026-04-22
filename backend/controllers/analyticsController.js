import { getSpendingAnalytics } from "../services/analytics/analyticsService.js";
import { getBurnRate } from "../services/analytics/burnrateService.js";
import { getAnalyticsSummary } from "../services/analytics/summaryService.js";

// Funtion to get analytics data within a specified date range for the authenticated user
export const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "startDate and endDate are required",
            });
        }

        const userId = req.user.id;

        const data = await getSpendingAnalytics(
            userId,
            new Date(startDate),
            new Date(endDate)
        );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Analytics Error:", error);

        return res.status(500).json({
            message: "Analytics error",
        });
    }
};

// Function to calculate the burn rate for the authenticated user over a specified number of days
export const getBurnRateController = async (req, res) => {
    try {
        const { days } = req.query;
        const userId = req.user.id;

        const endDate = new Date();

        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (days ? Number(days) : 30));

        const data = await getBurnRate(userId, startDate, endDate);
        
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Burn Rate Error:", error);

        return res.status(500).json({
            message: "Burn rate error",
        });
    }
};

// Function to get a comprehensive financial summary for the authenticated user over a specified date range
export const getSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "startDate and endDate are required",
            });
        }

        const userId = req.user.id;

        const data = await getAnalyticsSummary(
            userId,
            new Date(startDate),
            new Date(endDate)
        );

        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("Summary Error:", error);

        return res.status(500).json({
            message: "Summary error",
        });
    }
};