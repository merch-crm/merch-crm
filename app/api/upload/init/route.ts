/**
 * Инициализация chunked upload
 */

import { NextRequest, NextResponse } from "next/server";
import { initUpload } from "@/lib/upload-stream";
import { z } from "zod";
import { getSession } from "@/lib/session";

const InitSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(500 * 1024 * 1024), // 500MB макс
  mimeType: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию через единый хелпер
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const validated = InitSchema.parse(body);

    const result = await initUpload(validated);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Некорректные параметры", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[Upload Init Error]:", error);
    return NextResponse.json(
      { error: "Ошибка инициализации загрузки" },
      { status: 500 }
    );
  }
}
