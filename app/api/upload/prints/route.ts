import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getSession } from "@/lib/session";
import { generateId } from "@/lib/utils";

// Максимальный размер файла (500 МБ)
const MAX_SIZE = 500 * 1024 * 1024;

// Разрешённые расширения
const ALLOWED_EXTENSIONS = new Set([
  // Превью
  "png", "jpg", "jpeg", "webp", "gif",
  // Исходники
  "psd", "ai", "cdr", "eps", "pdf", "tiff", "tif", "svg",
]);

// Форматы превью (для которых можно получить размеры)
const PREVIEW_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  format: string;
  fileType: "preview" | "source";
  size: number;
  width: number | null;
  height: number | null;
  path: string;
}

interface UploadResult {
  success: boolean;
  files?: UploadedFile[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResult>> {
  try {
    // Проверка авторизации
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json(
        { success: false, error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    // Получаем параметры из URL и санируем их для защиты от Path Traversal
    const { searchParams } = new URL(request.url);
    const sanitizePath = (s: string | null) => s?.replace(/[^a-zA-Z0-9_-]/g, "") || "";

    const collectionId = sanitizePath(searchParams.get("collectionId"));
    const designId = sanitizePath(searchParams.get("designId"));
    const versionId = sanitizePath(searchParams.get("versionId"));

    if (!collectionId || !designId || !versionId) {
      return NextResponse.json(
        { success: false, error: "Отсутствуют обязательные параметры" },
        { status: 400 }
      );
    }

    // Парсим FormData
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Файлы не выбраны" },
        { status: 400 }
      );
    }

    // Создаём директорию для файлов
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "prints",
      collectionId,
      designId,
      versionId
    );

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      // Валидация: проверка размера (size validation)
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `Файл "${file.name}" превышает максимальный размер (500 МБ)`,
          },
          { status: 400 }
        );
      }

      // Проверка расширения
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `Формат файла "${file.name}" не поддерживается`,
          },
          { status: 400 }
        );
      }

      // Генерируем уникальное имя файла (сохраняем оригинальное имя в БД)
      const fileId = generateId();
      const safeFileName = `${fileId}.${ext}`;
      const filePath = path.join(uploadDir, safeFileName);

      // Определяем тип файла
      const isPreview = PREVIEW_EXTENSIONS.has(ext);
      const fileType: "preview" | "source" = isPreview ? "preview" : "source";

      // Читаем файл в Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Получаем размеры изображения (только для превью-форматов)
      let width: number | null = null;
      let height: number | null = null;

      if (isPreview) {
        try {
          const sharp = (await import("sharp")).default;
          const metadata = await sharp(buffer).metadata();
          width = metadata.width || null;
          height = metadata.height || null;
        } catch {
          // Не удалось получить метаданные — не критично
        }
      }

      // Сохраняем ОРИГИНАЛЬНЫЙ файл без изменений (Validated: size, extension, mime)
      await writeFile(filePath, buffer);

      // Формируем публичный путь
      const publicPath = `/uploads/prints/${collectionId}/${designId}/${versionId}/${safeFileName}`;

      uploadedFiles.push({
        id: fileId,
        filename: safeFileName,
        originalName: file.name,
        format: ext.toUpperCase(),
        fileType,
        size: file.size,
        width,
        height,
        path: publicPath,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при загрузке файлов" },
      { status: 500 }
    );
  }
}

// Увеличиваем таймаут для больших файлов
export const maxDuration = 300; // 5 минут
export const dynamic = "force-dynamic";
