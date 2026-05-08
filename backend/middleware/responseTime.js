// Middleware to measure and set response time in headers
export const responseTimeMiddleware = (req, res, next) => {
    const started = process.hrtime.bigint();

    res.on("finish", () => {
        const ms =
            Number(process.hrtime.bigint() - started) / 1e6;

        // Prevent headers already sent crash
        if (!res.headersSent) {
            res.setHeader(
                "X-Response-Time",
                `${ms.toFixed(2)}ms`
            );
        }

        // Optional logging
        console.log(
            `${req.method} ${req.originalUrl} - ${ms.toFixed(2)}ms`
        );
    });

    next();
};