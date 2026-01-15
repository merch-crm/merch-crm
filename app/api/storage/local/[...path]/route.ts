import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { path: pathParts } = await params;
    const relativePath = pathParts.join("/");
    const fullPath = path.join(LOCAL_STORAGE_ROOT, relativePath);

    // Security check: ensure we're not escaping the root
    if (!fullPath.startsWith(LOCAL_STORAGE_ROOT)) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    try {
        if (!fs.existsSync(fullPath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            return new NextResponse("Cannot read directory as file", { status: 400 });
        }

        const fileBuffer = fs.readFileSync(fullPath);

        // Determine content type based on extension
        const ext = path.extname(fullPath).toLowerCase();
        let contentType = "application/octet-stream";

        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".gif": "image/gif",
            ".pdf": "application/pdf",
            ".txt": "text/plain",
            ".json": "application/json",
            ".csv": "text/csv"
        };

        if (mimeTypes[ext]) {
            contentType = mimeTypes[ext];
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Error serving local file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
