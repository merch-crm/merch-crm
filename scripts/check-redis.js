const Redis = require("ioredis");

async function check() {
    require('dotenv').config({ path: '.env.local' });
    const redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
    });

    try {
        const res = await redis.ping();
        console.log("Redis PING:", res);
        await redis.set("test-key", "Hello from dev environment");
        const val = await redis.get("test-key");
        console.log("Redis GET test-key:", val);
        redis.disconnect();
    } catch (e) {
        console.error("Redis connection failed:", e);
        process.exit(1);
    }
}

check();
