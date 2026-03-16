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

