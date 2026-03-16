import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const htmlPath = path.join(process.cwd(), "public", "design-variant-1.html");
        if (!fs.existsSync(htmlPath)) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const html = fs.readFileSync(htmlPath, "utf-8");
        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Security-Policy": "default-src * data: blob:;",
                "X-Frame-Options": "SAMEORIGIN",
            },
        });
    } catch (error) {
        console.error("[Design-Variant-1] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
