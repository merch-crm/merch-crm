import { cookies } from "next/headers";
import { createHmac, randomBytes } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.BETTER_AUTH_SECRET || "build_time_secret_placeholder";
const CSRF_COOKIE_NAME = "csrf_token";

/**
 * Генерирует новый CSRF-токен
 */
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", CSRF_SECRET!)
    .update(`${token}:${timestamp}`)
    .digest("hex");
  
  return `${token}:${timestamp}:${signature}`;
}

/**
 * Валидирует CSRF-токен
 */
export function validateCsrfToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [tokenValue, timestamp, signature] = parts;

  // Проверяем подпись
  const expectedSignature = createHmac("sha256", CSRF_SECRET!)
    .update(`${tokenValue}:${timestamp}`)
    .digest("hex");

  if (signature !== expectedSignature) return false;

  // Проверяем срок действия (24 часа)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  const maxAge = 24 * 60 * 60 * 1000;

  if (tokenAge > maxAge) return false;

  return true;
}

/**
 * Получает или создаёт CSRF-токен из cookies
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!token || !validateCsrfToken(token)) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Должен быть читаем JS для отправки в заголовке
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 часа
    });
  }

  return token;
}

/**
 * Проверяет CSRF-токен из заголовка запроса
 */
export async function verifyCsrfToken(headerToken: string | null): Promise<boolean> {
  if (!headerToken) return false;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken) return false;

  // Токены должны совпадать И быть валидными
  return headerToken === cookieToken && validateCsrfToken(cookieToken);
}
