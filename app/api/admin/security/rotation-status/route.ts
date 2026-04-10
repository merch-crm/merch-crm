/**
 * API для проверки статуса ротации секретов
 * Доступно только администраторам
 */

import { NextResponse } from "next/server";
import { getRotationStatus } from "@/lib/secrets-rotation";
import { isAdmin } from "@/lib/roles";
import { getSession } from "@/lib/session";

export async function GET() {
 try {
  // Используем единый хелпер для получения сессии с ролями
  const session = await getSession();

  if (!session || !isAdmin(session.roleSlug)) {
   return NextResponse.json(
    { error: "Доступ запрещён" },
    { status: 403 }
   );
  }

  const status = getRotationStatus();

  return NextResponse.json({
   ...status,
   lastCheck: new Date().toISOString(),
  });
 } catch (error) {
  console.error("Secret rotation status error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
 }
}
