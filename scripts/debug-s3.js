const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

async function test(name, accessKeyId, secretAccessKey, endpoint, bucket, region) {
    console.log(`\nTesting: ${name}`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Key: ${accessKeyId}`);

    const client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true
    });

    try {
        const start = Date.now();
        await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
        console.log(`✅ SUCCESS! Time: ${Date.now() - start}ms`);
        return true;
    } catch (e) {
        console.log(`❌ FAILED: ${e.name} - ${e.message}`);
        return false;
    }
}

async function run() {
    const s3_id = process.env.S3_ACCESS_KEY;
    const s3_key = process.env.S3_SECRET_KEY;
    const s3_end = process.env.S3_ENDPOINT;

    const reg_id = process.env.REG_STORAGE_ACCESS_KEY;
    const reg_key = process.env.REG_STORAGE_SECRET_KEY;
    const reg_end = process.env.REG_STORAGE_ENDPOINT;

    const bucket = process.env.S3_BUCKET || "merch-crm-storage";
    const region = "ru-1";

    // Possible combinations
    // 1. Current S3 in .env
    await test("S3 Config", s3_id, s3_key, s3_end, bucket, region);

    // 2. Old REG Config in .env
    await test("REG Config", reg_id, reg_key, reg_end, bucket, region);

    // 3. S3 Keys with REG Endpoint
    await test("S3 Keys + REG Endpoint", s3_id, s3_key, reg_end, bucket, region);

    // 4. REG Keys with S3 Endpoint
    await test("REG Keys + S3 Endpoint", reg_id, reg_key, s3_end, bucket, region);
}

run().catch(console.error);
