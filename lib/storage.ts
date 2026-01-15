import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, ListObjectsV2Output, DeleteObjectCommand, CopyObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT || process.env.REG_STORAGE_ENDPOINT || "https://s3.regru.cloud";
const region = process.env.S3_REGION || process.env.REG_STORAGE_REGION || "ru-1";
const bucketName = process.env.S3_BUCKET || process.env.REG_STORAGE_BUCKET || "merch-crm-storage";

const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || process.env.REG_STORAGE_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || process.env.REG_STORAGE_SECRET_KEY || "",
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


export async function listFiles(prefix?: string) {
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix === "" ? undefined : prefix,
            Delimiter: "/",
        });

        const response = await s3Client.send(command);

        const folders = response.CommonPrefixes?.map(p => p.Prefix || "").filter(Boolean) || [];
        const files = response.Contents?.filter(obj => obj.Key !== prefix).map(obj => ({
            key: obj.Key || "",
            size: obj.Size || 0,
            lastModified: obj.LastModified
        })) || [];

        return { folders, files };
    } catch (error) {
        console.error("Error listing files:", error);
        return { folders: [], files: [] };
    }
}

export async function createFolder(path: string) {
    try {
        // In S3, a folder is just an empty object ending with /
        const folderKey = path.endsWith("/") ? path : `${path}/`;
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: folderKey,
            Body: "",
        });
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error creating folder:", error);
        return { success: false, error };
    }
}

export async function deleteFile(key: string) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error };
    }
}

export async function deleteMultipleFiles(keys: string[]) {
    try {
        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: keys.map(key => ({ Key: key })),
                Quiet: false,
            },
        });
        const response = await s3Client.send(command);
        return {
            success: true,
            deleted: response.Deleted?.length || 0,
            errors: response.Errors || []
        };
    } catch (error) {
        console.error("Error deleting multiple files:", error);
        return { success: false, error };
    }
}

export async function renameFile(oldKey: string, newKey: string) {
    try {
        // Copy the object to the new key
        const copyCommand = new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldKey}`,
            Key: newKey,
        });
        await s3Client.send(copyCommand);

        // Delete the old object
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldKey,
        });
        await s3Client.send(deleteCommand);

        return { success: true };
    } catch (error) {
        console.error("Error renaming file:", error);
        return { success: false, error };
    }
}

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

            const response: ListObjectsV2Output = await s3Client.send(command);

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
