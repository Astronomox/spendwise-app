import { parseBankSMS } from "../services/sms/smsParser.js";

const samples = [
    "Debit Alert! You spent ₦5000 at KFC Lekki",
    "GTBank: N12,000 debited via POS SHOPRITE IKEJA",
    "You have received N50,000 from John Doe",
    "POS MTN NGN 2000",
];

samples.forEach((sms) => {
    console.log("\nSMS:", sms);
    console.log(parseBankSMS(sms));
});