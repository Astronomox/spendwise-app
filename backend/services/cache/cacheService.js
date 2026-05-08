import redis from "../../config/redis.js";

class CacheService {

    async get(key) {
        try {
            const value = await redis.get(key);

            if (!value) return null;

            return JSON.parse(value);

        } catch (error) {
            console.error("Cache GET error:", error.message);
            return null;
        }
    }

    async set(key, value, ttlSeconds = 60) {
        try {
            await redis.set(
                key,
                JSON.stringify(value),
                "EX",
                ttlSeconds
            );

        } catch (error) {
            console.error("Cache SET error:", error.message);
        }
    }

    async del(key) {
        try {
            await redis.del(key);

        } catch (error) {
            console.error("Cache DEL error:", error.message);
        }
    }

    async exists(key) {
        try {
            return await redis.exists(key);

        } catch (error) {
            console.error("Cache EXISTS error:", error.message);
            return false;
        }
    }

    async delPattern(pattern) {
        try {
            const stream = redis.scanStream({
                match: pattern,
                count: 100,
            });

            stream.on("data", async (keys) => {
                if (keys.length) {
                    await redis.del(...keys);
                }
            });

        } catch (error) {
            console.error("Cache pattern delete error:", error.message);
        }
    }

    async ttl(key) {
        try {
            return await redis.ttl(key);

        } catch (error) {
            console.error("Cache TTL error:", error.message);
            return -1;
        }
    }
}

export default new CacheService();