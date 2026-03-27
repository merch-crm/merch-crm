/**
 * CSRF-защита для Server Actions
 * @module lib/auth/csrf
 */

import { headers } from "next/headers";
import { verifyCsrfToken } from "@/lib/csrf";

/**
 * Обертка для Server Actions с проверкой CSRF-токена
 * @param action - Исходная функция действия
 * @returns Функция с проверкой CSRF
 */
export function withCsrf<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult | { success: false; error: string }> => {
    // В тестовом окружении пропускаем проверку
    if (process.env.NODE_ENV === "test") {
      return action(...args);
    }

    const headersList = await headers();
    const csrfToken = headersList.get("x-csrf-token");

    const isValid = await verifyCsrfToken(csrfToken);

    if (!isValid) {
      return {
        success: false as const,
        error: "Недействительный CSRF-токен. Обновите страницу и попробуйте снова.",
      };
    }

    return action(...args);
  };
}
