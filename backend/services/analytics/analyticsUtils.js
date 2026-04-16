import { toNaira, safeNumber } from "../../utils/money.js";

export const calculateDays = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};