/**
 * API для получения CSRF-токена
 */

import { NextResponse } from "next/server";
import { getCsrfToken } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getCsrfToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
