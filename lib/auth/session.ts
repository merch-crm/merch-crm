import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Получает текущего авторизованного пользователя
 * @returns Пользователь или null
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}
