import prisma from "../../config/prisma.js";

// Function to detect merchant category from text using keywords in the database
const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

export const detectCategoryFromText = async (text) => {
    const keywords = await prisma.merchantKeyword.findMany({
        include: { category: true },
    });

    const normalizedText = normalize(text);

    for (const k of keywords) {
        const keyword = normalize(k.keyword);

        if (normalizedText.includes(keyword)) {
            return k.category;
        }
    }

    return null;
};