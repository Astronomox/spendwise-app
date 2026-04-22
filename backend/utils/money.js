export const toNaira = (kobo = 0) => kobo / 100;
export const safeNumber = (value) => value || 0;

// Helper to format transaction response
export const formatTransaction = (tx) => ({
    ...tx,
    amountNaira: toNaira(tx.amountKobo),
});
