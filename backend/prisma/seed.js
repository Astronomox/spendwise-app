import prisma from "../config/prisma.js";

async function seed() {
    // Use EXISTING USER
    const userId = "f1c40ab7-a1b8-4679-b464-b913f3ac02d1";

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found in database");
    }

    // 1. CATEGORIES (idempotent)
    const categories = [
        "Food",
        "Transport",
        "Bills",
        "Shopping",
        "Data",
        "Income",
        "Other",
    ];

    const categoryMap = {};

    for (const name of categories) {
        let category = await prisma.category.findFirst({
            where: { name, userId: null },
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name, isSystem: true },
        });
        }

        categoryMap[name] = category;
}

    // 2. TRANSACTIONS (mock data for testing APIs)
    await prisma.transaction.createMany({
        data: [
            {
                userId,
                categoryId: categoryMap["Food"].id,
                amountKobo: 5000 * 100,
                type: "EXPENSE",
                description: "Jollof Rice",
                transactionDate: new Date("2026-01-10"),
            },
            {
                userId,
                categoryId: categoryMap["Transport"].id,
                amountKobo: 2000 * 100,
                type: "EXPENSE",
                description: "Bolt ride",
                transactionDate: new Date("2026-01-11"),
            },
            {
                userId,
                categoryId: categoryMap["Bills"].id,
                amountKobo: 10000 * 100,
                type: "EXPENSE",
                description: "Electricity bill",
                transactionDate: new Date("2026-01-12"),
            },
            {
                userId,
                categoryId: categoryMap["Food"].id,
                amountKobo: 3000 * 100,
                type: "EXPENSE",
                description: "Chicken suya",
                transactionDate: new Date("2026-01-13"),
            },
            {
                userId,
                categoryId: categoryMap["Shopping"].id,
                amountKobo: 15000 * 100,
                type: "EXPENSE",
                description: "Clothes from Jumia",
                transactionDate: new Date("2026-01-14"),
            },
            {
                userId,
                categoryId: categoryMap["Data"].id,
                amountKobo: 5000 * 100,
                type: "EXPENSE",
                description: "MTN data subscription",
                transactionDate: new Date("2026-01-15"),
                },
                ],
        });

    await prisma.categoryKeyword.createMany({
    data: [
        // Food & Dining
        { keyword: "suya", categoryId: categoryMap["Food"].id },
        { keyword: "jollof", categoryId: categoryMap["Food"].id },
        { keyword: "rice", categoryId: categoryMap["Food"].id },
        { keyword: "amala", categoryId: categoryMap["Food"].id },
        { keyword: "eba", categoryId: categoryMap["Food"].id },
        { keyword: "fufu", categoryId: categoryMap["Food"].id },
        { keyword: "egusi", categoryId: categoryMap["Food"].id },
        { keyword: "pounded yam", categoryId: categoryMap["Food"].id },
        { keyword: "asun", categoryId: categoryMap["Food"].id },
        { keyword: "chicken", categoryId: categoryMap["Food"].id },
        { keyword: "fish", categoryId: categoryMap["Food"].id },
        { keyword: "meat", categoryId: categoryMap["Food"].id },
        { keyword: "pepper soup", categoryId: categoryMap["Food"].id },
        { keyword: "ofada", categoryId: categoryMap["Food"].id },
        { keyword: "moi moi", categoryId: categoryMap["Food"].id },
        { keyword: "akara", categoryId: categoryMap["Food"].id },
        { keyword: "beans", categoryId: categoryMap["Food"].id },
        { keyword: "plantain", categoryId: categoryMap["Food"].id },
        { keyword: "yam", categoryId: categoryMap["Food"].id },
        { keyword: "shawarma", categoryId: categoryMap["Food"].id },
        { keyword: "burger", categoryId: categoryMap["Food"].id },
        { keyword: "pizza", categoryId: categoryMap["Food"].id },
        { keyword: "chicken republic", categoryId: categoryMap["Food"].id },
        { keyword: "kfc", categoryId: categoryMap["Food"].id },
        { keyword: "dominos", categoryId: categoryMap["Food"].id },
        { keyword: "coldstone", categoryId: categoryMap["Food"].id },
        { keyword: "sweet sensation", categoryId: categoryMap["Food"].id },
        { keyword: "bukka", categoryId: categoryMap["Food"].id },
        { keyword: "restaurant", categoryId: categoryMap["Food"].id },
        { keyword: "lunch", categoryId: categoryMap["Food"].id },
        { keyword: "dinner", categoryId: categoryMap["Food"].id },
        { keyword: "breakfast", categoryId: categoryMap["Food"].id },
        { keyword: "snacks", categoryId: categoryMap["Food"].id },
        { keyword: "gala", categoryId: categoryMap["Food"].id },
        { keyword: "lacasera", categoryId: categoryMap["Food"].id },
        { keyword: "coke", categoryId: categoryMap["Food"].id },
        { keyword: "fanta", categoryId: categoryMap["Food"].id },
        { keyword: "drink", categoryId: categoryMap["Food"].id },
        { keyword: "water", categoryId: categoryMap["Food"].id },
        { keyword: "grocery", categoryId: categoryMap["Food"].id },
        { keyword: "provisions", categoryId: categoryMap["Food"].id },

        // Transport
        { keyword: "bolt", categoryId: categoryMap["Transport"].id },
        { keyword: "uber", categoryId: categoryMap["Transport"].id },
        { keyword: "taxi", categoryId: categoryMap["Transport"].id },
        { keyword: "keke", categoryId: categoryMap["Transport"].id },
        { keyword: "okada", categoryId: categoryMap["Transport"].id },
        { keyword: "bike", categoryId: categoryMap["Transport"].id },
        { keyword: "bus", categoryId: categoryMap["Transport"].id },
        { keyword: "danfo", categoryId: categoryMap["Transport"].id },
        { keyword: "transport", categoryId: categoryMap["Transport"].id },
        { keyword: "fuel", categoryId: categoryMap["Transport"].id },
        { keyword: "petrol", categoryId: categoryMap["Transport"].id },
        { keyword: "diesel", categoryId: categoryMap["Transport"].id },
        { keyword: "gas", categoryId: categoryMap["Transport"].id },
        { keyword: "filling station", categoryId: categoryMap["Transport"].id },
        { keyword: "parking", categoryId: categoryMap["Transport"].id },
        { keyword: "toll", categoryId: categoryMap["Transport"].id },
        { keyword: "lekki toll", categoryId: categoryMap["Transport"].id },
        { keyword: "ferry", categoryId: categoryMap["Transport"].id },
        { keyword: "cowry", categoryId: categoryMap["Transport"].id },
        { keyword: "mechanic", categoryId: categoryMap["Transport"].id },
        { keyword: "car wash", categoryId: categoryMap["Transport"].id },

        // Bills
        { keyword: "electricity", categoryId: categoryMap["Bills"].id },
        { keyword: "light", categoryId: categoryMap["Bills"].id },
        { keyword: "nepa", categoryId: categoryMap["Bills"].id },
        { keyword: "phcn", categoryId: categoryMap["Bills"].id },
        { keyword: "prepaid", categoryId: categoryMap["Bills"].id },
        { keyword: "postpaid", categoryId: categoryMap["Bills"].id },
        { keyword: "ekedc", categoryId: categoryMap["Bills"].id },
        { keyword: "ikedc", categoryId: categoryMap["Bills"].id },
        { keyword: "aedc", categoryId: categoryMap["Bills"].id },
        { keyword: "water bill", categoryId: categoryMap["Bills"].id },
        { keyword: "rent", categoryId: categoryMap["Bills"].id },
        { keyword: "house rent", categoryId: categoryMap["Bills"].id },
        { keyword: "waste", categoryId: categoryMap["Bills"].id },
        { keyword: "lawma", categoryId: categoryMap["Bills"].id },
        { keyword: "sanitation", categoryId: categoryMap["Bills"].id },
        { keyword: "tv", categoryId: categoryMap["Bills"].id },
        { keyword: "dstv", categoryId: categoryMap["Bills"].id },
        { keyword: "gotv", categoryId: categoryMap["Bills"].id },
        { keyword: "startimes", categoryId: categoryMap["Bills"].id },
        { keyword: "cable", categoryId: categoryMap["Bills"].id },
        { keyword: "subscription", categoryId: categoryMap["Bills"].id },
        { keyword: "netflix", categoryId: categoryMap["Bills"].id },
        { keyword: "spotify", categoryId: categoryMap["Bills"].id },

        // Data
        { keyword: "mtn", categoryId: categoryMap["Data"].id },
        { keyword: "airtel", categoryId: categoryMap["Data"].id },
        { keyword: "glo", categoryId: categoryMap["Data"].id },
        { keyword: "9mobile", categoryId: categoryMap["Data"].id },
        { keyword: "airtime", categoryId: categoryMap["Data"].id },
        { keyword: "data", categoryId: categoryMap["Data"].id },
        { keyword: "recharge", categoryId: categoryMap["Data"].id },
        { keyword: "internet", categoryId: categoryMap["Data"].id },
        { keyword: "wifi", categoryId: categoryMap["Data"].id },
        { keyword: "spectranet", categoryId: categoryMap["Data"].id },
        { keyword: "smile", categoryId: categoryMap["Data"].id },
        { keyword: "swift", categoryId: categoryMap["Data"].id },

        // Shopping
        { keyword: "jumia", categoryId: categoryMap["Shopping"].id },
        { keyword: "konga", categoryId: categoryMap["Shopping"].id },
        { keyword: "jiji", categoryId: categoryMap["Shopping"].id },
        { keyword: "clothes", categoryId: categoryMap["Shopping"].id },
        { keyword: "shoes", categoryId: categoryMap["Shopping"].id },
        { keyword: "bag", categoryId: categoryMap["Shopping"].id },
        { keyword: "shirt", categoryId: categoryMap["Shopping"].id },
        { keyword: "trouser", categoryId: categoryMap["Shopping"].id },
        { keyword: "dress", categoryId: categoryMap["Shopping"].id },
        { keyword: "makeup", categoryId: categoryMap["Shopping"].id },
        { keyword: "perfume", categoryId: categoryMap["Shopping"].id },
        { keyword: "cream", categoryId: categoryMap["Shopping"].id },
        { keyword: "soap", categoryId: categoryMap["Shopping"].id },
        { keyword: "shampoo", categoryId: categoryMap["Shopping"].id },
        { keyword: "electronics", categoryId: categoryMap["Shopping"].id },
        { keyword: "phone", categoryId: categoryMap["Shopping"].id },
        { keyword: "laptop", categoryId: categoryMap["Shopping"].id },
        { keyword: "charger", categoryId: categoryMap["Shopping"].id },
        { keyword: "earpiece", categoryId: categoryMap["Shopping"].id },
        { keyword: "headphones", categoryId: categoryMap["Shopping"].id },
        { keyword: "speaker", categoryId: categoryMap["Shopping"].id },
        { keyword: "slot", categoryId: categoryMap["Shopping"].id },
        { keyword: "shoprite", categoryId: categoryMap["Shopping"].id },
        { keyword: "spar", categoryId: categoryMap["Shopping"].id },
        { keyword: "market", categoryId: categoryMap["Shopping"].id },
        { keyword: "supermarket", categoryId: categoryMap["Shopping"].id },
        { keyword: "mall", categoryId: categoryMap["Shopping"].id },
        { keyword: "palms", categoryId: categoryMap["Shopping"].id },
        { keyword: "ikeja city mall", categoryId: categoryMap["Shopping"].id },
    ],
    skipDuplicates: true,
});
        console.log("Mock transactions seeded successfully for testing APIs");
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });