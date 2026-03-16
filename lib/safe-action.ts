import { z } from "zod";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { ActionResult, err, ErrorCode } from "@/lib/types";
import { AppError, ValidationError } from "@/lib/errors";

// Список системных ролей по умолчанию для экшенов, требующих авторизации
type AllowedRole = "Администратор" | "Руководство" | "Отдел продаж" | "Дизайнер" | "Печать" | "Вышивка" | "Склад" | "Менеджер";

interface SafeActionContext {
    userId: string;
    roleName: string;
}

interface ActionOptions<TInput, TOutput> {
    schema?: z.ZodType<TInput>;
    roles?: AllowedRole[];
    requireAuth?: boolean;
    handler: (input: TInput, ctx: SafeActionContext) => Promise<ActionResult<TOutput>>;
    onSuccess?: (data?: TOutput) => void;
    onError?: (error: string) => void;
}

/**
 * Создает безопасный Server Action с автоматической авторизацией, валидацией схемы Zod
 * и перехватом ошибок. Возвращает унифицированный ActionResult.
 */
export function createSafeAction<TInput = void, TOutput = void>({
    schema,
    roles,
    requireAuth = true,
    handler,
}: ActionOptions<TInput, TOutput>) {
    return async (inputData?: unknown): Promise<ActionResult<TOutput>> => {
        let ctx: SafeActionContext = { userId: "", roleName: "" };

        // 1. Авторизация и проверка ролей
        if (requireAuth) {
            const session = await getSession();
            if (!session) {
                return err("Не авторизован", "UNAUTHORIZED");
            }

            ctx = { userId: session.id, roleName: session.roleName };

            if (roles && roles.length > 0) {
                if (!roles.includes(session.roleName as AllowedRole)) {
                    return err("Недостаточно прав", "FORBIDDEN");
                }
            }
        }

        // 2. Валидация входных данных через Zod
        let parsedInput: TInput = inputData as TInput;
        
        if (schema) {
            // Если пришли FormData, преобразуем в объект (упрощенная конвертация)
            let dataToValidate = inputData;
            if (inputData instanceof FormData) {
                dataToValidate = Object.fromEntries(inputData.entries());
            }

            const validation = schema.safeParse(dataToValidate);
            if (!validation.success) {
                const issues = validation.error.issues.map(i => i.message);
                return { 
                    success: false, 
                    error: issues[0] || "Ошибка валидации данных", 
                    issues,
                    code: "VALIDATION_ERROR" as ErrorCode
                };
            }
            parsedInput = validation.data;
        }

        // 3. Выполнение логики обработчика с перехватом ошибок
        try {
            return await handler(parsedInput, ctx);
        } catch (error) {
            return await handleActionError(error, handler.name || "anonymous", inputData) as ActionResult<TOutput>;
        }
    };
}

/**
 * Централизованный обработчик ошибок для Server Actions.
 */
export async function handleActionError(
    error: unknown, 
    methodName: string = "unknown", 
    inputData?: unknown
): Promise<ActionResult<unknown>> {
    // Внутреннее логирование непредвиденных ошибок
    if (!(error instanceof AppError)) {
        await logError({
            error,
            path: "safe-action",
            method: methodName,
            details: typeof inputData === "object" && inputData !== null ? (inputData as Record<string, unknown>) : undefined
        });
    }

    if (error instanceof AppError) {
        return {
            success: false,
            error: error.message,
            code: error.code as ErrorCode,
            issues: error instanceof ValidationError ? error.issues : undefined
        };
    }

    return err(error instanceof Error ? error.message : "Внутренняя ошибка сервера", "INTERNAL_ERROR");
}
