import { withRateLimit } from "@/lib/api-middleware";
import { NextResponse } from "next/server";

async function uploadHandler(_req: Request) {
    // В реальном приложении здесь была бы логика сохранения файла
    // Например, через lib/local-storage или S3
    return NextResponse.json({ success: true, message: "Upload handler placeholder" });
}

export const POST = withRateLimit(uploadHandler, { type: "upload" });
