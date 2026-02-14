/**
 * Shared result type for all Server Actions and API responses.
 * Standardization (L-03, L-10)
 */
export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; issues?: string[] };
