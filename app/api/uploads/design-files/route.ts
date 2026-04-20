import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getSession } from "@/lib/session";
import { generateId } from "@/lib/utils";

const UPLOADS_PATH = process.env.UPLOADS_PATH || "./uploads";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const _type = formData.get("type") as string; // mockup, print, original
    const designId = formData.get("designId") as string;
    const orderId = formData.get("orderId") as string;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    // Определяем путь сохранения
    let savePath: string;
    const fileId = generateId();
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const filename = `${fileId}${ext}`;

    if (designId) {
      // Для коллекций: /uploads/collections/${designId}/
      savePath = path.join(UPLOADS_PATH, "collections", designId);
    } else if (orderId) {
      // Для заказов: /uploads/orders/${year}/${month}/${orderId}/
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      savePath = path.join(UPLOADS_PATH, "orders", year, month, orderId);
    } else {
      // Общая папка
      savePath = path.join(UPLOADS_PATH, "temp");
    }

    // Создаём директорию если не существует
    if (!existsSync(savePath)) {
      await mkdir(savePath, { recursive: true });
    }

    const fullPath = path.join(savePath, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Сохраняем оригинал
    await writeFile(fullPath, buffer);

    // Создаём миниатюру для изображений
    let thumbnailPath: string | null = null;
    if (file.type.startsWith("image/")) {
      try {
        const sharp = (await import("sharp")).default;
        const thumbnailFilename = `${fileId}_thumb${ext}`;
        const thumbnailFullPath = path.join(savePath, thumbnailFilename);

        await sharp(buffer)
          .resize(300, 300, { fit: "inside", withoutEnlargement: true })
          .toFile(thumbnailFullPath);

        thumbnailPath = `/uploads/${path.relative(UPLOADS_PATH, thumbnailFullPath).replace(/\\/g, "/")}`;
      } catch (e) {
        console.warn("Failed to create thumbnail:", e);
      }
    }

    const relativePath = `/uploads/${path.relative(UPLOADS_PATH, fullPath).replace(/\\/g, "/")}`;

    return NextResponse.json({
      success: true,
      path: relativePath,
      thumbnailPath,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки файла" },
      { status: 500 }
    );
  }
}
