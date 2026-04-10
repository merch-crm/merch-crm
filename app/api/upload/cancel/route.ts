/**
 * Отмена незавершённой загрузки
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cancelUpload } from "@/lib/upload-stream";

export async function POST(request: NextRequest) {
 const session = await auth.api.getSession({
  headers: await headers(),
 });

 if (!session) {
  return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
 }

 try {
  const { uploadId } = await request.json();

  if (!uploadId) {
   return NextResponse.json(
    { error: "Отсутствует uploadId" },
    { status: 400 }
   );
  }

  await cancelUpload(uploadId);

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Upload Cancel Error]:", error);
  return NextResponse.json(
   { error: "Ошибка отмены загрузки" },
   { status: 500 }
  );
 }
}
