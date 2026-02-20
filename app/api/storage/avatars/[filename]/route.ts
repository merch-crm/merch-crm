import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Check if user is authenticated (even if it's just their own avatar, they should be logged in to see any system content)
    // You might want to relax this if avatars are public, but for a CRM it's safer to require auth.
    const session = await getSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Security check: only allow image files and prevent directory traversal
    if (!filename.match(/^[a-z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i)) {
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
