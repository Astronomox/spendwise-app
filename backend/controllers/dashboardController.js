import { successResponse } from "../utils/apiResponse.js";
import { getDashboardData } from "../services/dashboard/dashboardService.js";

// Fetches and returns all dashboard data for the authenticated user
export const getDashboard = async ( req, res) => {
    try {
        const data =
            await getDashboardData(req.user.id);

        res.json(
            successResponse(
                data,
                "Dashboard fetched"
            )
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};