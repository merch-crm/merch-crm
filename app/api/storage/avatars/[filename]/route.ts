import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";
import { getSession } from "@/lib/session";

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

        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return new NextResponse("Not a file", { status: 400 });
        }

        const stream = fs.createReadStream(filePath);
        const webStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk: string | Buffer) => {
                    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
                    controller.enqueue(new Uint8Array(buffer));
                });
                stream.on("end", () => controller.close());
                stream.on("error", (err) => controller.error(err));
            },
            cancel() {
                stream.destroy();
            }
        });

        // Determine content type
        let contentType = "image/jpeg";
        if (filename.endsWith(".png")) contentType = "image/png";
        if (filename.endsWith(".webp")) contentType = "image/webp";

        return new NextResponse(webStream, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Length": stats.size.toString(),
            },
        });
    } catch (error) {
        console.error("Error serving avatar:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
