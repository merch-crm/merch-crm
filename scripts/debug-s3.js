const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

async function test(accessKey, secretKey) {
    const client = new S3Client({
        region: "ru-1",
        endpoint: "https://s3.regru.cloud",
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        forcePathStyle: true,
        maxAttempts: 1
    });

    console.log(`Testing AK: ${accessKey}, SK: ...${secretKey.slice(-5)}`);
    const start = Date.now();
    try {
        const command = new ListObjectsV2Command({
            Bucket: "merch-crm-storage",
            MaxKeys: 1
        });
        await client.send(command);
        console.log("SUCCESS!");
        return true;
    } catch (err) {
        console.log(`FAILED with ${err.name}: ${err.message}`);
        return false;
    } finally {
        console.log(`Duration: ${Date.now() - start}ms`);
    }
}

async function debug() {
    const sk1 = "ZEFFxisDZZSojaasSmyLsnp9KhKCstviYelZFEfh"; // with 'l'
    const sk2 = "ZEFFxisDZZSojaasSmyLsnp9KhKCstviYeIZFEfh"; // with 'I'

    console.log("--- Batch 1: Secret with 'l' ---");
    await test("S5GORAOOUWV81QDIOGMA", sk1);
    await test("S5GORA00UWV81QDIOGMA", sk1);

    console.log("--- Batch 2: Secret with 'I' ---");
    await test("S5GORAOOUWV81QDIOGMA", sk2);
    await test("S5GORA00UWV81QDIOGMA", sk2);

    console.log("--- Batch 3: Try 19-char ID from old env ---");
    await test("S5GORA0UWV81QDIOGMA", sk2);
}

debug();
