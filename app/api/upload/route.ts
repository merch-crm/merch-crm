import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

function getExtensionFromMagicBytes(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;
    const header = buffer.toString('hex', 0, 12).toUpperCase();

    if (header.startsWith('FFD8FF')) return 'jpg';
    if (header.startsWith('89504E470D0A1A0A')) return 'png';
    if (header.startsWith('474946383761') || header.startsWith('474946383961')) return 'gif';
    if (header.startsWith('52494646') && header.substring(16, 24) === '57454250') return 'webp';

    return null;
}

export async function POST(req: NextRequest) {
    const ip = getClientIP(req);
    const rlResult = await rateLimit(`upload:${ip}`, RATE_LIMITS.upload.limit, RATE_LIMITS.upload.windowSec);

    if (!rlResult.success) {
        return NextResponse.json({ success: false, error: RATE_LIMITS.upload.message }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const contentType = req.headers.get("content-type") || "";
        let buffer: Buffer;
        let folder = "uploads";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            const folderParam = formData.get("folder") as string;

            if (!file) {
                return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
            }
            if (folderParam) folder = folderParam;

            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (contentType.includes("application/json")) {
            const data = await req.json();
            if (!data.file) {
                return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
            }
            if (data.folder) folder = data.folder;

            const base64Data = data.file.replace(/^data:.*?;base64,/, "");
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            return NextResponse.json({ success: false, error: "Unsupported content type" }, { status: 415 });
        }

        // Валидация по magic bytes
        const ext = getExtensionFromMagicBytes(buffer);
        if (!ext) {
            return NextResponse.json({ success: false, error: "Недопустимый формат файла (разрешены только JPEG, PNG, GIF, WebP)" }, { status: 400 });
        }

        // Ограничение размера (10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (buffer.length > MAX_SIZE) {
            return NextResponse.json({ success: false, error: "Размер файла не должен превышать 10MB" }, { status: 400 });
        }

        // Защита от path traversal
        const sanitizedFolder = folder.replace(/\.\./g, "").replace(/[^a-zA-Z0-9_-]/g, "");

        // Determine save location. 
        // Certain folders go to the root 'local-storage' directory, others to public/uploads
        const isLocalStorage = ["avatars", "branding", "items", "sku"].includes(sanitizedFolder);

        const fileName = `${uuidv4()}.${ext}`;
        let publicUrl = "";

        if (isLocalStorage) {
            const { saveLocalFile } = await import("@/lib/local-storage");
            const storagePath = `${sanitizedFolder}/${fileName}`;
            await saveLocalFile(storagePath, buffer); // Validated: size, extension, mime
            publicUrl = `/api/storage/local/${storagePath}`;
        } else {
            const uploadDir = join(process.cwd(), "public", "uploads", sanitizedFolder);
            await mkdir(uploadDir, { recursive: true });
            const filePath = join(uploadDir, fileName);
            await writeFile(filePath, buffer); // Validated: size, extension, mime
            publicUrl = `/uploads/${sanitizedFolder}/${fileName}`;
        }

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
