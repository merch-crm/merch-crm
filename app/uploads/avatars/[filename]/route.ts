import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";

/**
 * Compatibility route for old avatar paths like /uploads/avatars/filename.jpg
 * Redirects or serves them from the new local-storage/avatars location.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Security check: only allow image files and prevent directory traversal
    if (!filename.match(/^[a-z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i)) {
        return new NextResponse("Invalid filename", { status: 400 });
    }

    try {
        // Try to find the file in the new local-storage location
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
        console.error("Error serving legacy avatar:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
