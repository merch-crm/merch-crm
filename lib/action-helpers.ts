import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { 
  ActionResult, 
  ERRORS,
} from "@/lib/types";
import { 
  SessionUser, 
  UserWithRelations, 
  WithAuthOptions, 
  ActionError,
  ROLE_GROUPS,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ROLES
} from "./action-utils";

export { ROLE_GROUPS, ROLES, NotFoundError, ValidationError, ForbiddenError, ActionError };
export type { SessionUser, UserWithRelations, WithAuthOptions };

// ═══════════════════════════════════════════════════════════
// Основной хелпер withAuth
// ═══════════════════════════════════════════════════════════

/**
 * Обёртка для server actions с авторизацией
 */
export async function withAuth<T>(
  action: (session: SessionUser, user?: UserWithRelations) => Promise<ActionResult<T>>,
  options?: WithAuthOptions
): Promise<ActionResult<T>> {
  try {
    // 1. Проверяем сессию
    const session = await getSession();
    if (!session) {
      return ERRORS.UNAUTHORIZED;
    }

    // 2. Загружаем пользователя если нужна проверка ролей или явно запрошено
    let user: UserWithRelations | undefined;
    
    if (options?.roles || options?.loadUser) {
      const dbUser = await db.query.users.findFirst({
        where: eq(schema.users.id, session.id),
        with: {
          role: true,
          department: true,
        },
      });

      if (!dbUser) {
        return ERRORS.UNAUTHORIZED;
      }

      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role ? {
          id: dbUser.role.id,
          name: dbUser.role.name,
          permissions: (dbUser.role.permissions as Record<string, boolean>) || {},
        } : null,
        department: dbUser.department ? {
          id: dbUser.department.id,
          name: dbUser.department.name,
        } : null,
      };

      // 3. Проверяем права
      if (options.roles) {
        const hasAccess = typeof options.roles === 'function'
          ? options.roles(user.role?.name || '', user)
          : options.roles.includes(user.role?.name || '');

        if (!hasAccess) {
          return ERRORS.FORBIDDEN();
        }
      }
    }

    // 4. Выполняем action
    return await action(session as unknown as SessionUser, user);

  } catch (error) {
    // 5. Логируем и возвращаем ошибку
    await logError({
      error,
      path: options?.errorPath || 'unknown',
      method: 'withAuth',
    });

    if (error instanceof ActionError) {
      return { success: false, error: error.message, code: error.code };
    }

    console.error('[withAuth] Unexpected error:', error);
    return ERRORS.INTERNAL();
  }
}

// ═══════════════════════════════════════════════════════════
// Новые хелперы с CSRF-защитой (Double Submit Cookie)
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { verifyCsrfToken } from "@/lib/csrf";
import { headers } from "next/headers";

interface SafeActionOptions {
  /** Требовать CSRF-токен (по умолчанию true для мутаций) */
  requireCsrf?: boolean;
}

/**
 * Создаёт безопасный Server Action с валидацией и CSRF-защитой
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  action: (validatedData: TInput) => Promise<TOutput>,
  options: SafeActionOptions = {}
) {
  const { requireCsrf = true } = options;

  return async (data: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // 1. CSRF-проверка для мутаций
      if (requireCsrf && process.env.NODE_ENV === "production") {
        const headersList = await headers();
        const csrfToken = headersList.get("x-csrf-token");
        
        const isValidCsrf = await verifyCsrfToken(csrfToken);
        if (!isValidCsrf) {
          console.error("[SafeAction CSRF Error]: Missing or invalid CSRF token in header");
          return {
            success: false,
            error: "Недействительный CSRF-токен. Обновите страницу и попробуйте снова.",
          };
        }
      }

      // 2. Валидация входных данных
      const validationResult = schema.safeParse(data);
      if (!validationResult.success) {
        console.error("[SafeAction Validation Error]:", validationResult.error.format());
        const errorMessage = validationResult.error.errors
          .map((e) => e.message)
          .join(", ");
        return { success: false, error: errorMessage };
      }

      // 3. Выполнение действия
      const result = await action(validationResult.data);
      return { success: true, data: result };

    } catch (error) {
      console.error("[SafeAction Error]:", error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: "Произошла непредвиденная ошибка" };
    }
  };
}

/**
 * Вариант для запросов (без CSRF, только валидация)
 */
export function createSafeQuery<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  query: (validatedData: TInput) => Promise<TOutput>
) {
  return createSafeAction(schema, query, { requireCsrf: false });
}

