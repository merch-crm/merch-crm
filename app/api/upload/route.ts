import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { file, folder = "uploads" } = await req.json();

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        // Валидация MIME-типа
        const mimeMatch = file.match(/^data:(image\/(jpeg|png|gif|webp|svg\+xml));base64,/);
        if (!mimeMatch) {
            return NextResponse.json({ success: false, error: "Разрешены только изображения (JPEG, PNG, GIF, WebP, SVG)" }, { status: 400 });
        }

        // Обработка base64
        const base64Data = file.replace(/^data:image\/\w+(\+\w+)?;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Ограничение размера (10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (buffer.length > MAX_SIZE) {
            return NextResponse.json({ success: false, error: "Размер файла не должен превышать 10MB" }, { status: 400 });
        }

        // Защита от path traversal
        const sanitizedFolder = folder.replace(/\.\./g, "").replace(/[^a-zA-Z0-9_-]/g, "");

        // Путь для сохранения
        const uploadDir = join(process.cwd(), "public", "uploads", sanitizedFolder);
        await mkdir(uploadDir, { recursive: true });

        const fileName = `${uuidv4()}.jpg`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${sanitizedFolder}/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
