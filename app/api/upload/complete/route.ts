/**
 * Завершение загрузки
 */

import { NextRequest, NextResponse } from "next/server";
import { completeUpload, createUploadReadStream, cleanupTempFile } from "@/lib/upload-stream";
import { uploadToS3 } from "@/lib/storage";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
 try {
  // Проверяем авторизацию
  const session = await getSession();

  if (!session) {
   return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { uploadId, destination } = await request.json();

  if (!uploadId) {
   return NextResponse.json(
    { error: "Отсутствует uploadId" },
    { status: 400 }
   );
  }

  // Завершаем локальную загрузку
  const uploadResult = await completeUpload(uploadId);

  // Создаём поток для S3
  const fileStream = createUploadReadStream(uploadResult.tempPath);

  // Стримим в S3
  const s3Result = await uploadToS3({
   stream: fileStream,
   fileName: uploadResult.fileName,
   mimeType: uploadResult.mimeType,
   destination: destination || "uploads",
  });

  // Удаляем временный файл
  await cleanupTempFile(uploadResult.tempPath);

  return NextResponse.json({
   success: true,
   file: {
    url: s3Result.url,
    key: s3Result.key,
    fileName: uploadResult.fileName,
    fileSize: uploadResult.fileSize,
    mimeType: uploadResult.mimeType,
   },
  });
 } catch (error) {
  console.error("[Upload Complete Error]:", error);

  if (error instanceof Error) {
   return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
   { error: "Ошибка завершения загрузки" },
   { status: 500 }
  );
 }
}
