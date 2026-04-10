---
description: Security patterns for Authentication and Role-Based Access Control in the CRM.
related_to: [[nextjs-server-actions-pro]] [[vulnerability-scanner]]
---
# Authentication & RBAC

CRM systems handle sensitive data. Absolute adherence to RBAC rules is required to prevent privilege escalation or data leaks.

## Core Rules
1. **Auth Context Extraction**: Session fetching should happen centrally via the standardized auth module in `lib/` (e.g., `getSession()` from `lib/session.ts` or `lib/auth/`).
2. **Route Guards (Middleware)**:
  - Next.js `middleware.ts` should ONLY be used for high-level routing redirects (e.g., redirect unauthenticated from `/dashboard` to `/login`).
  - Do NOT rely entirely on Middleware for authorization rule enforcement.
3. **Component Level RBAC**: Use a declarative pattern to render role-specific UI on the server.
  ```tsx
  {user.role === 'ADMIN' && <AdminPanel />}
  ```
4. **Data Level Authorization**:
  - Server Actions and API Routes must confirm the user has the required permission BEFORE performing any logic (e.g., `if (!canEditUser(user.role)) throw new Error("Unauthorized")`).
  - Database queries should implicitly scope results (e.g., a manager only fetches orders from their assigned store `where(eq(orders.storeId, user.storeId))`).
5. **Principle of Least Privilege**: Default to DENY. Only explicitly defined roles/permissions should allow access.
