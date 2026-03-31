/**
 * Загрузка отдельного чанка
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadChunk } from "@/lib/upload-stream";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const uploadId = request.headers.get("x-upload-id");
    const chunkIndex = parseInt(request.headers.get("x-chunk-index") || "0", 10);

    if (!uploadId) {
      return NextResponse.json(
        { error: "Отсутствует x-upload-id" },
        { status: 400 }
      );
    }

    // Читаем бинарные данные
    const data = Buffer.from(await request.arrayBuffer());

    const result = await uploadChunk({
      uploadId,
      chunkIndex,
      data,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Upload Chunk Error]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Ошибка загрузки чанка" },
      { status: 500 }
    );
  }
}

// Отключаем bodyParser для обработки бинарных данных напрямую
export const config = {
  api: {
    bodyParser: false,
  },
};
