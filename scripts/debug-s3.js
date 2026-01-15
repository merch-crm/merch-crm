const { S3Client, ListBucketsCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");

// Load .env.local or .env
const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
require('dotenv').config({ path: envPath });

async function debugS3() {
    console.log("=== S3 Debugger ===");
    console.log(`Using credentials from: ${envPath}`);
    console.log(`S3_ENDPOINT: ${process.env.S3_ENDPOINT}`);
    console.log(`S3_REGION: ${process.env.S3_REGION}`);
    console.log(`S3_BUCKET: ${process.env.S3_BUCKET}`);
    console.log(`S3_ACCESS_KEY: ${process.env.S3_ACCESS_KEY ? "***Present***" : "MISSING"}`);
    console.log(`S3_SECRET_KEY: ${process.env.S3_SECRET_KEY ? "***Present***" : "MISSING"}`);

    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
        console.error("❌ CRITICAL: Missing Access Key or Secret Key");
        return;
    }

    const client = new S3Client({
        region: process.env.S3_REGION || "ru-1",
        endpoint: process.env.S3_ENDPOINT || "https://s3.regru.cloud",
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
        },
        forcePathStyle: true,
    });

    try {
        console.log("\n1. Testing ListBuckets (Connectivity check)...");
        const buckets = await client.send(new ListBucketsCommand({}));
        console.log("✅ Connection Successful! Buckets found:", buckets.Buckets?.map(b => b.Name).join(", "));
    } catch (e) {
        console.error("❌ ListBuckets Failed:", e.message);
        // console.error("Full Error:", e); // Avoid circular JSON
        return;
    }

    try {
        console.log("\n2. Testing Write Permission (Upload)...");
        const testKey = `debug-test-${Date.now()}.txt`;
        await client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: testKey,
            Body: "Debug Test",
        }));
        console.log(`✅ Upload Successful: ${testKey}`);

        console.log("\n3. Testing Delete Permission (Delete)...");
        await client.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: testKey,
        }));
        console.log("✅ Delete Successful");

    } catch (e) {
        console.error("❌ Write/Delete Operations Failed:", e.message);
    }
}

debugS3();
