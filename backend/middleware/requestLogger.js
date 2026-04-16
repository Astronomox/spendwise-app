export const requestLogger = (req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const diff = process.hrtime(start);
        const timeInMs = diff[0] * 1000 + diff[1] / 1e6;

        const log = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: timeInMs.toFixed(2),
        };

        // highlight slow requests
        if (timeInMs > 300) {
            console.warn("SLOW REQUEST:", log);
        } else {
            console.log("FAST REQUEST:", log);
        }
    });

    next();
};