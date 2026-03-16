import { auth, type User, type BetterAuthSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema/users";
import { eq } from "drizzle-orm";
import { getOrSetCache } from "./redis";

export interface Session {
    id: string;
    sessionId: string;
    email: string;
    name: string;
    roleName: string;
    roleId: string;
    departmentName: string;
    ua: string;
    expires: Date;
    betterAuthUser: User;
    betterAuthSession: BetterAuthSession;
}

export async function getSession() {
  try {
    const result = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!result) {
      // Fallback checkout for legacy JWT session or simply return null
      return null;
    }

    const { session, user } = result;

    // Кэширование данных пользователя для исключения лишних JOIN на каждый запрос
    const cacheKey = `user-profile:${user.id}`;
    const dbUser = await getOrSetCache(
        cacheKey,
        async () => {
            return db.query.users.findFirst({
                where: eq(users.id, user.id),
                with: {
                    role: true,
                    department: true,
                }
            });
        },
        300 // 5 минут кэша (SHORT)
    );

    if (!dbUser) return null;

    // Return an object that matches the old Session interface exactly
    return {
        id: user.id,
        sessionId: session.id,
        email: user.email,
        name: user.name,
        roleName: dbUser.role?.name || "",
        roleId: dbUser.roleId || "",
        departmentName: dbUser.department?.name || "",
        ua: session.userAgent || "",
        expires: session.expiresAt,
        // Preserve standard better-auth properties under their namespace if needed
        betterAuthUser: user,
        betterAuthSession: session,
    } as Session;
  } catch (error) {
    console.error("[Session] Failed to get session:", error);
    return null;
  }
}
