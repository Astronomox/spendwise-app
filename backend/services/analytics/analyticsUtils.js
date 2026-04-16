export const toNaira = (kobo = 0) => kobo / 100;

export const safeNumber = (value) => value || 0;

export const calculateDays = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};