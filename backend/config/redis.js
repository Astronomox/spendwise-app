import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,

    retryStrategy(times) {
        return Math.min(times * 200, 2000);
    },

    enableReadyCheck: true,

    tls:
        process.env.NODE_ENV === "production"
            ? {}
            : undefined,
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err) => {
    console.error("Redis error FULL:", err);
});

export default redis;