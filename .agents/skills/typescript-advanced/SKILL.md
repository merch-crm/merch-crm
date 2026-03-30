---
description: Advanced TypeScript patterns. Strict typing, Zod validations, generics, and avoiding any.
related_to: [[drizzle-expert]] [[nextjs-server-actions-pro]]
---
# TypeScript Advanced Patterns

For MerchCRM, we require strict TypeScript conventions to ensure zero runtime errors related to types.

## Core Rules
1. **Never use `any`**: If a type is unknown, use `unknown` and narrow it with type guards or Zod schemas. 
2. **Zod Validation**: Use `zod` at every boundary (API inputs, DB returns, UI forms). Parse over cast.
3. **Discriminated Unions**: State management and API responses should heavily utilize discriminated unions for predictable type narrowing. 
   ```typescript
   type ApiResponse<T> = 
     | { status: 'success'; data: T } 
     | { status: 'error'; error: string };
   ```
4. **Utility Types**: Leverage `Pick`, `Omit`, `Partial`, and `Required` instead of redefining identical interfaces.
5. **No Type Assertions (`as T`)**: Fix the inference chain upstream instead of asserting types playfully, unless interacting with a completely untyped third-party library or dealing with DOM nodes.
