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

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function getStorageStats() {
    let totalSize = 0;
    let fileCount = 0;
    let continuationToken: string | undefined = undefined;

    try {
        do {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                ContinuationToken: continuationToken,
            });

            const response = await s3Client.send(command);

            if (response.Contents) {
                for (const object of response.Contents) {
                    totalSize += object.Size || 0;
                    fileCount++;
                }
            }

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        return { size: totalSize, fileCount };
    } catch (error) {
        console.error("Error fetching storage stats:", error);
        // Fallback to 0 if we can't read the bucket (e.g. permission issues)
        return { size: 0, fileCount: 0 };
    }
}

export { s3Client };
