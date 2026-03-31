---
description: Next.js Server Actions patterns and state management. Cache invalidation, mutations, and form state.
related_to: [[typescript-advanced]] [[authentication-rbac]]
---
# Next.js Server Actions Pro

Standard architecture for working with Next.js App Router mutations.

## Core Rules
1. **File Convention**: Server actions must be defined in standalone `actions/` files or explicitly exported from specific `_actions.ts` files with `"use server"` at the very top.
2. **Input Validation**: EVERY Server Action must validate inputs using `zod` and return a standard payload: `{ success: boolean, data?: T, error?: string }` (or use modern libraries like `next-safe-action`).
3. **Authentication Guarding**: EVERY Server Action must start by verifying the session (e.g., `await getSession()`). Do not blindly trust the client payload.
4. **Form Integration**:
   - Use `useActionState` (or `useFormState`) for connecting server actions to Client Component forms.
   - For optimistic UI, pair the action with `useOptimistic`.
5. **Cache Invalidation**: 
   - Actions modifying data MUST explicitly invalidate the Next.js cache using `revalidatePath` or `revalidateTag`.
6. **Error Handling**: Do not throw raw errors from Server Actions (which could leak to the client). Catch, log securely, and return safe error strings.
