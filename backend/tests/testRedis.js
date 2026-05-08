// testRedis.js

import redis from "../config/redis.js";

await redis.set("test", "working");

const value = await redis.get("test");

console.log(value);