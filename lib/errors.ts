/**
 * Базовый класс для всех ошибок приложения.
 * Позволяет передавать код ошибки и HTTP-статус.
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "INTERNAL_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Ошибка 404: Ресурс не найден.
 */
export class NotFoundError extends AppError {
  constructor(entity: string = "Ресурс") {
    super(`${entity} не найден`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Ошибка 401: Пользователь не авторизован.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Не авторизован") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Ошибка 403: Доступ запрещен.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Недостаточно прав") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Ошибка 400: Ошибка валидации данных.
 */
export class ValidationError extends AppError {
  constructor(message: string = "Ошибка валидации данных", public issues?: string[]) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

/**
 * Ошибка 409: Конфликт (например, ресурс уже существует).
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}
