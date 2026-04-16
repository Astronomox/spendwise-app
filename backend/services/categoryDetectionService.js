import prisma from "../config/prisma.js";

export const detectCategory = async (description = "") => {
    if (!description) return null;

    const normalizedText = description.toLowerCase();

    // fetch all keywords + their categories
    const keywords = await prisma.categoryKeyword.findMany({
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
}
    });

    let bestMatch = null;
    let highestScore = 0;

    for (const keyword of keywords) {
        const keywordText = keyword.keyword.toLowerCase();

        // simple match scoring (can be improved later with NLP)
        if (normalizedText.includes(keywordText)) {
            const score = keywordText.length;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = keyword.category;
            }
        }
    }

    return bestMatch ? bestMatch.id : null;
};