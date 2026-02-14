/**
 * Shared result type for all Server Actions and API responses.
 * Standardization (L-03, L-10)
 */
export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; issues?: string[] };

/**
 * Type guard to check if an action was successful and has data.
 */
export function isSuccess<T>(result: ActionResult<T>): result is { success: true; data: T } {
    return result.success === true && result.data !== undefined;
}
