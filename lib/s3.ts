import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || "https://s3.regru.cloud",
    region: process.env.S3_REGION || "ru-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
    },
    forcePathStyle: true, // Required for Reg.ru and many other S3 providers
});

const BUCKET_NAME = process.env.S3_BUCKET || "merch-crm-storage";

export async function uploadFile(
    file: Buffer | Uint8Array,
    fileName: string,
    contentType: string
) {
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
    });

    try {
        await s3Client.send(command);
        return {
            key,
            url: `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`
        };
    } catch (error) {
        console.error("S3 upload error:", error);
        throw new Error("Failed to upload file to S3");
    }
}

export async function getPresignedUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    try {
        return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
        console.error("S3 presigned url error:", error);
        throw new Error("Failed to generate signed URL");
    }
}

export default s3Client;
