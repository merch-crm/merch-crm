import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { Session } from "./auth";

/**
 * Validates that the current session belongs to an administrator.
 * Throws an error if not authorized, or returns the user object.
 * Useful for reducing boilerplate in server actions.
 */
export async function requireAdmin(session: Session | null) {
    if (!session) {
        throw new Error("Unauthorized");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (user?.role?.name !== "Администратор") {
        throw new Error("Доступ запрещен");
    }

    return user;
}
