import jwt from "jsonwebtoken";

const token = jwt.sign(
    { id: "3f289b2b-a659-4295-a3a8-85412d4685dd" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

console.log(token);