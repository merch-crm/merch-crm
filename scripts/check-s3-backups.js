const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const https = require("https");
require('dotenv').config({ path: '.env.local' });

async function listS3() {
    const s3 = new S3Client({
        region: process.env.REG_STORAGE_REGION || "ru-1",
        endpoint: process.env.REG_STORAGE_ENDPOINT,
        credentials: {
            accessKeyId: process.env.REG_STORAGE_ACCESS_KEY,
            secretAccessKey: process.env.REG_STORAGE_SECRET_KEY,
        },
        forcePathStyle: true,
        requestHandler: new NodeHttpHandler({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        })
    });

    try {
        console.log(`🔍 Listing objects in bucket: ${process.env.REG_STORAGE_BUCKET}`);
        const data = await s3.send(new ListObjectsV2Command({
            Bucket: process.env.REG_STORAGE_BUCKET
        }));

        if (data.Contents) {
            data.Contents.forEach(obj => {
                console.log(`- ${obj.Key} (${obj.Size} bytes)`);
            });
        } else {
            console.log("Empty bucket.");
        }
    } catch (err) {
        console.error("Error listing S3:", err);
    }
}

listS3();
