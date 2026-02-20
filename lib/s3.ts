import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

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

interface UploadOptions {
    compress?: boolean;
}

export async function uploadFile(
    file: Buffer | Uint8Array,
    fileName: string,
    contentType: string,
    options: UploadOptions = {}
) {
    let body = file;
    let finalContentType = contentType;
    let finalFileName = fileName;

    // Image compression logic
    if (options.compress && contentType.startsWith("image/") && !contentType.includes("svg") && !contentType.includes("gif")) {
        try {
            const image = sharp(file);

            // Standardize to WebP, max 2560px, quality 85
            // We'll standardize to WebP, max 2560px (good for high-res screens but saves huge print files drift)
            // Quality 85 is very safe visually.
            body = await image
                .resize(2560, 2560, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 85 })
                .toBuffer();

            finalContentType = "image/webp";
            // Replace extension with .webp
            finalFileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
        } catch (error) {
            console.error("Image compression failed, proceeding with original:", error);
            // Fallback to original
        }
    }

    const key = `uploads/${Date.now()}-${finalFileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: finalContentType,
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
