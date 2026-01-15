import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Security check: only allow image files and prevent directory traversal
    if (!filename.match(/^avatar_[a-z0-9_]+\.(jpg|jpeg|png|webp)$/i)) {
        return new NextResponse("Invalid filename", { status: 400 });
    }

    try {
        const filePath = path.join(LOCAL_STORAGE_ROOT, "avatars", filename);

        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        // Determine content type
        let contentType = "image/jpeg";
        if (filename.endsWith(".png")) contentType = "image/png";
        if (filename.endsWith(".webp")) contentType = "image/webp";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving avatar:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
