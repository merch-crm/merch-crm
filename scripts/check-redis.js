const Redis = require("ioredis");

async function check() {
    const redis = new Redis({
        host: "127.0.0.1",
        port: 6379,
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
