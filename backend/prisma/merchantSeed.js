import prisma from "../config/prisma.js";

async function seedMerchantKeywords() {
    // Fetch categories
    const categories = await prisma.category.findMany({
        where: { isSystem: true },
    });

    const getCategoryId = (name) =>
        categories.find((c) => c.name === name)?.id;

    const data = [
        // FOOD
        "kfc",
        "chicken republic",
        "sweet sensation",
        "dominos",
        "coldstone",
        "item7",
        "kilimanjaro",
        "mr biggs",
        "tantalizers",
        "bukka",
        "restaurant",
        "eatery",
        "food",
        "shawarma",
        "suya",
        "chop",
        "glovo",
        "chowdeck",

        // SHOPPING
        "shoprite",
        "spar",
        "justrite",
        "market square",
        "e-beano",
        "supermarket",
        "mall",
        "boutique",
        "clothes",
        "zara",
        "balogun market",
        "computer village",
        "jumia",
        "konga",
        "jiji",

        // TRANSPORT
        "uber",
        "bolt",
        "lagride",
        "inDrive",
        "taxify",
        "bus",
        "danfo",
        "keke",
        "okada",
        "transport",
        "fuel",
        "petrol",
        "nnpc",
        "total",
        "mobil",
        "ap filling station",

        // DATA / TELECOM
        "mtn",
        "airtel",
        "glo",
        "9mobile",
        "spectranet",
        "smile",
        "swift",
        "recharge",
        "airtime",
        "data bundle",

        // BILLS
        "ikedc",
        "ekedc",
        "aedc",
        "nepa",
        "phcn",
        "electricity",
        "power",
        "dstv",
        "gotv",
        "startimes",
        "netflix",
        "spotify",
        "apple music",
        "rent",
        "lawma",

        // INCOME
        "salary",
        "payment received",
        "transfer from",
        "credit alert",
        "refund",
        "cashback",
        "bonus",
        "commission",
        "fiverr",
        "upwork",
        "paystack",
        "flutterwave",

        // FINTECH / BANK PATTERNS 
        "opay",
        "palmpay",
        "kuda",
        "moniepoint",
        "paga",
        "first bank",
        "gtbank",
        "access bank",
        "zenith bank",
        "uba",
        "wema",
        "stanbic",
        "pos",
        "atm withdrawal",
        "transfer",
        "debit alert",
    ];

    // Map keywords → categories
    const mappings = data.map((keyword) => {
        let categoryName = "Other";

        if (
            ["kfc","chicken republic","sweet sensation","dominos","coldstone","item7","kilimanjaro","mr biggs","tantalizers","bukka","restaurant","eatery","food","shawarma","suya","chop","glovo","chowdeck"].includes(keyword)
        ) {
            categoryName = "Food";
        }

        else if (
            ["shoprite","spar","justrite","market square","e-beano","supermarket","mall","boutique","clothes","zara","balogun market","computer village","jumia","konga","jiji"].includes(keyword)
        ) {
            categoryName = "Shopping";
        }

        else if (
            ["uber","bolt","lagride","indrive","taxify","bus","danfo","keke","okada","transport","fuel","petrol","nnpc","total","mobil","ap filling station"].includes(keyword)
        ) {
            categoryName = "Transport";
        }

        else if (
            ["mtn","airtel","glo","9mobile","spectranet","smile","swift","recharge","airtime","data bundle"].includes(keyword)
        ) {
            categoryName = "Data";
        }

        else if (
            ["ikedc","ekedc","aedc","nepa","phcn","electricity","power","dstv","gotv","startimes","netflix","spotify","apple music","rent","lawma"].includes(keyword)
        ) {
            categoryName = "Bills";
        }

        else if (
            ["salary","payment received","transfer from","credit alert","refund","cashback","bonus","commission","fiverr","upwork","paystack","flutterwave"].includes(keyword)
        ) {
            categoryName = "Income";
        }

        return {
            keyword,
            categoryId: getCategoryId(categoryName),
        };
    });

    // Remove invalid mappings
    const filtered = mappings.filter((m) => m.categoryId);

    await prisma.merchantKeyword.createMany({
        data: filtered,
        skipDuplicates: true,
    });

    console.log(" Nigerian merchant keywords seeded successfully");
}

seedMerchantKeywords()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });