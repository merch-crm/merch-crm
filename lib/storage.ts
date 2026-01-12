import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.REG_STORAGE_REGION || "ru-1";
const endpoint = process.env.REG_STORAGE_ENDPOINT || "https://s3.reg0.rusrv.ru";
const bucketName = process.env.REG_STORAGE_BUCKET || "";

const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId: process.env.REG_STORAGE_ACCESS_KEY || "",
        secretAccessKey: process.env.REG_STORAGE_SECRET_KEY || "",
    },
    forcePathStyle: true, // Often required for S3-compatible providers
});

export async function uploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType?: string
) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    try {
        await s3Client.send(command);
        return key;
    } catch (error) {
        console.error("Error uploading file to Reg.ru Storage:", error);
        throw error;
    }
}

export async function getFileUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return url;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error;
    }
}

export { s3Client };
