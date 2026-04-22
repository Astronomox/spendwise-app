import { detectCategoryFromText } from "../merchant/merchantService.js";

// Function to normalize text for better parsing (e.g., remove commas, currency symbols, etc.)
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/,/g, "")
        .replace(/₦|ngn/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

// Function to extract amount from SMS text
const extractAmount = (text) => {
    const match = text.match(/(\d+(\.\d{1,2})?)/);

    if (!match) return 0;

    return Math.round(parseFloat(match[0]) * 100);
};

// Function to detect transaction type (INCOME or EXPENSE) from SMS text
const detectType = (text) => {
    if (
        text.includes("credit") ||
        text.includes("received") ||
        text.includes("deposit") 
    ) {
        return "INCOME";
    }

    if (
        text.includes("debit") ||
        text.includes("spent") ||
        text.includes("withdraw")
    ) {
        return "EXPENSE";
    }

    return "EXPENSE"; // default
};

// Function to extract merchant name from SMS text
const extractMerchant = (text) => {
    const lowerText = text.toLowerCase();

    // GTBank: "GTB: Transfer for Shoprite" or "GTBank to Jumia"
    const gtbMatch = text.match(/gtb(?:ank)?[:\-]?\s*.*?(?:for|to)\s+([a-z0-9\s]+)/i);
    if (gtbMatch) {
        return gtbMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // First Bank: "First Bank: Payment to KFC"
    const firstbankMatch = text.match(/first\s*bank[:\-]?\s*.*?(?:for|to)\s+([a-z0-9\s]+)/i);
    if (firstbankMatch) {
        return firstbankMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Access Bank: "Access Bank transfer to Bolt"
    const accessMatch = text.match(/access\s*bank[:\-]?\s*.*?(?:for|to)\s+([a-z0-9\s]+)/i);
    if (accessMatch) {
        return accessMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Zenith Bank: "Zenith: Payment for DSTV"
    const zenithMatch = text.match(/zenith[:\-]?\s*.*?(?:for|to)\s+([a-z0-9\s]+)/i);
    if (zenithMatch) {
        return zenithMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // UBA: "UBA transfer to MTN"
    const ubaMatch = text.match(/uba[:\-]?\s*.*?(?:for|to)\s+([a-z0-9\s]+)/i);
    if (ubaMatch) {
        return ubaMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Opay: "Opay to Chicken Republic" or "OPay transfer for lunch"
    const opayMatch = text.match(/opay[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (opayMatch) {
        return opayMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Palmpay: "Palmpay to Uber"
    const palmpayMatch = text.match(/palm\s*pay[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (palmpayMatch) {
        return palmpayMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Kuda: "Kuda transfer to Jumia"
    const kudaMatch = text.match(/kuda[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (kudaMatch) {
        return kudaMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Moniepoint: "Moniepoint payment for electricity"
    const moniepointMatch = text.match(/monie\s*point[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (moniepointMatch) {
        return moniepointMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Flutterwave: "Flutterwave to Paystack"
    const flutterwaveMatch = text.match(/flutter\s*wave[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (flutterwaveMatch) {
        return flutterwaveMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Paystack: "Paystack payment for Jumia"
    const paystackMatch = text.match(/pay\s*stack[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (paystackMatch) {
        return paystackMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Chipper Cash: "Chipper transfer to friend"
    const chipperMatch = text.match(/chipper[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (chipperMatch) {
        return chipperMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Carbon: "Carbon loan payment"
    const carbonMatch = text.match(/carbon[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (carbonMatch) {
        return carbonMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // FairMoney: "FairMoney to Shoprite"
    const fairmoneyMatch = text.match(/fair\s*money[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (fairmoneyMatch) {
        return fairmoneyMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Renmoney: "Renmoney payment"
    const renmoneyMatch = text.match(/ren\s*money[:\-]?\s*.*?(?:to|for)\s+([a-z0-9\s]+)/i);
    if (renmoneyMatch) {
        return renmoneyMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // POS transactions: "POS Shoprite Ikeja" or "POS payment at KFC"
    const posMatch = text.match(/pos\s+(?:payment\s+)?(?:at\s+)?([a-z0-9\s]+)/i);
    if (posMatch) {
        return posMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Transfer patterns: "Transfer to John Doe" or "Sent to Jane"
    const transferMatch = text.match(/(?:transfer|sent|paid)[:\-]?\s*(?:to|for)\s+([a-z0-9\s]+)/i);
    if (transferMatch) {
        return transferMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Generic "at" pattern: "Payment at Coldstone"
    const atMatch = text.match(/(?:payment\s+)?at\s+([a-z0-9\s]+)/i);
    if (atMatch) {
        return atMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Generic "from" pattern: "Purchased from Amazon"
    const fromMatch = text.match(/(?:purchase[d]?\s+)?from\s+([a-z0-9\s]+)/i);
    if (fromMatch) {
        return fromMatch[1].trim().split(" ").slice(0, 3).join(" ");
    }

    // Direct merchant names (common patterns)
    // Food delivery
    if (lowerText.includes("glovo")) return "Glovo";
    if (lowerText.includes("chowdeck")) return "Chowdeck";
    if (lowerText.includes("item7") || lowerText.includes("item 7")) return "Item 7";
    
    // Transport
    if (lowerText.includes("bolt")) return "Bolt";
    if (lowerText.includes("uber")) return "Uber";
    
    // Shopping
    if (lowerText.includes("jumia")) return "Jumia";
    if (lowerText.includes("konga")) return "Konga";
    if (lowerText.includes("jiji")) return "Jiji";
    if (lowerText.includes("amazon")) return "Amazon";
    
    // Food chains
    if (lowerText.includes("chicken republic")) return "Chicken Republic";
    if (lowerText.includes("kfc")) return "KFC";
    if (lowerText.includes("dominos") || lowerText.includes("domino's")) return "Dominos";
    if (lowerText.includes("coldstone")) return "Coldstone";
    if (lowerText.includes("sweet sensation")) return "Sweet Sensation";
    
    // Supermarkets
    if (lowerText.includes("shoprite")) return "Shoprite";
    if (lowerText.includes("spar")) return "Spar";
    if (lowerText.includes("ebeano")) return "Ebeano";
    
    // Telcos
    if (lowerText.includes("mtn")) return "MTN";
    if (lowerText.includes("airtel")) return "Airtel";
    if (lowerText.includes("glo")) return "Glo";
    if (lowerText.includes("9mobile")) return "9mobile";
    
    // Utilities
    if (lowerText.includes("dstv")) return "DSTV";
    if (lowerText.includes("gotv")) return "GOtv";
    if (lowerText.includes("startimes")) return "Startimes";
    if (lowerText.includes("ekedc")) return "EKEDC";
    if (lowerText.includes("ikedc")) return "IKEDC";
    if (lowerText.includes("aedc")) return "AEDC";
    if (lowerText.includes("phcn")) return "PHCN";
    
    // Streaming
    if (lowerText.includes("netflix")) return "Netflix";
    if (lowerText.includes("spotify")) return "Spotify";
    if (lowerText.includes("prime video") || lowerText.includes("amazon prime")) return "Prime Video";

    return "Unknown";
};

// Function to extract balance from SMS text
const extractBalance = (text) => {
    const match = text.match(/bal(?:ance)?[:\s]+(\d+)/);

    if (!match) return null;

    return parseFloat(match[1]) * 100;
};

// Parser function to process SMS text and extract bank names
const extractBank = (text) => {
    const lowerText = text.toLowerCase();

    // Traditional Banks
    if (lowerText.includes("gtb") || lowerText.includes("guaranty trust") || lowerText.includes("gtbank")) 
        return "GTBank";
    if (lowerText.includes("first bank") || lowerText.includes("firstbank")) 
        return "First Bank";
    if (lowerText.includes("access bank") || lowerText.includes("access")) 
        return "Access Bank";
    if (lowerText.includes("zenith bank") || lowerText.includes("zenith")) 
        return "Zenith Bank";
    if (lowerText.includes("uba") || lowerText.includes("united bank for africa")) 
        return "UBA";
    if (lowerText.includes("union bank")) 
        return "Union Bank";
    if (lowerText.includes("fidelity bank") || lowerText.includes("fidelity")) 
        return "Fidelity Bank";
    if (lowerText.includes("sterling bank") || lowerText.includes("sterling")) 
        return "Sterling Bank";
    if (lowerText.includes("stanbic ibtc") || lowerText.includes("stanbic")) 
        return "Stanbic IBTC";
    if (lowerText.includes("wema bank") || lowerText.includes("wema")) 
        return "Wema Bank";
    if (lowerText.includes("fcmb") || lowerText.includes("first city monument")) 
        return "FCMB";
    if (lowerText.includes("ecobank")) 
        return "Ecobank";
    if (lowerText.includes("polaris bank") || lowerText.includes("polaris")) 
        return "Polaris Bank";
    if (lowerText.includes("keystone bank") || lowerText.includes("keystone")) 
        return "Keystone Bank";
    if (lowerText.includes("heritage bank") || lowerText.includes("heritage")) 
        return "Heritage Bank";
    if (lowerText.includes("unity bank") || lowerText.includes("unity")) 
        return "Unity Bank";
    if (lowerText.includes("providus bank") || lowerText.includes("providus")) 
        return "Providus Bank";
    if (lowerText.includes("jaiz bank") || lowerText.includes("jaiz")) 
        return "Jaiz Bank";
    if (lowerText.includes("suntrust bank") || lowerText.includes("suntrust")) 
        return "SunTrust Bank";
    if (lowerText.includes("citibank") || lowerText.includes("citi")) 
        return "Citibank";
    if (lowerText.includes("standard chartered")) 
        return "Standard Chartered";

    // Digital Banks & Fintech
    if (lowerText.includes("opay")) 
        return "Opay";
    if (lowerText.includes("palmpay") || lowerText.includes("palm pay")) 
        return "Palmpay";
    if (lowerText.includes("kuda bank") || lowerText.includes("kuda")) 
        return "Kuda";
    if (lowerText.includes("moniepoint") || lowerText.includes("monie point")) 
        return "Moniepoint";
    if (lowerText.includes("vfd") || lowerText.includes("v bank")) 
        return "VFD Microfinance Bank";
    if (lowerText.includes("rubies bank") || lowerText.includes("rubies")) 
        return "Rubies Bank";
    if (lowerText.includes("sparkle") || lowerText.includes("sparkle bank")) 
        return "Sparkle";
    if (lowerText.includes("carbon") || lowerText.includes("carbon account")) 
        return "Carbon";
    if (lowerText.includes("fairmoney") || lowerText.includes("fair money")) 
        return "FairMoney";
    if (lowerText.includes("renmoney") || lowerText.includes("ren money")) 
        return "Renmoney";
    if (lowerText.includes("chipper cash") || lowerText.includes("chipper")) 
        return "Chipper Cash";
    if (lowerText.includes("paga")) 
        return "Paga";
    if (lowerText.includes("piggyvest") || lowerText.includes("piggy vest")) 
        return "PiggyVest";
    if (lowerText.includes("cowrywise") || lowerText.includes("cowry wise")) 
        return "Cowrywise";
    if (lowerText.includes("alat") || lowerText.includes("alat by wema")) 
        return "ALAT by Wema";
    if (lowerText.includes("vbank")) 
        return "VBank";

    // Payment Processors (sometimes act as source)
    if (lowerText.includes("flutterwave") || lowerText.includes("flutter wave")) 
        return "Flutterwave";
    if (lowerText.includes("paystack") || lowerText.includes("pay stack")) 
        return "Paystack";
    if (lowerText.includes("interswitch")) 
        return "Interswitch";
    if (lowerText.includes("quickteller")) 
        return "Quickteller";

    // Microfinance Banks
    if (lowerText.includes("lapo microfinance") || lowerText.includes("lapo")) 
        return "LAPO Microfinance Bank";
    if (lowerText.includes("fortis microfinance") || lowerText.includes("fortis")) 
        return "Fortis Microfinance Bank";
    if (lowerText.includes("accion microfinance") || lowerText.includes("accion")) 
        return "Accion Microfinance Bank";
    if (lowerText.includes("grooming microfinance") || lowerText.includes("grooming")) 
        return "Grooming Microfinance Bank";

    return "Unknown Bank";
};

// Final Parser function to process SMS text and return structured data
export const parseBankSMS = (rawText) => {
    const text = normalizeText(rawText);

    const amountKobo = extractAmount(text);
    const type = detectType(text);
    const bank = extractBank(text);
    const merchant = bank || extractMerchant(text);
    const balanceKobo = extractBalance(text);

    return {
        amountKobo,
        type,
        merchant,
        balanceKobo,
        rawText,
        transactionDate: new Date(),
    };
};