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

        console.log("🌱 Mock transactions seeded successfully for testing APIs");
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });