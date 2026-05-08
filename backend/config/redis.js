import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,

    retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
    },

    enableReadyCheck: true,
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err) => {
    console.error("Redis error:", err.message);
});

export default redis;