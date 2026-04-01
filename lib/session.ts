import { auth } from "@/lib/auth";
import type { User, Session as BetterAuthSession } from "better-auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema/users";
import { eq } from "drizzle-orm";
import { redisCache } from "./cache";
import { cache } from "react";

export interface Session {
    id: string;
    sessionId: string;
    email: string;
    name: string;
    roleName: string;
    roleSlug: string;
    roleId: string;
    departmentName: string;
    ua: string;
    expires: Date;
    betterAuthUser: User;
    betterAuthSession: BetterAuthSession;
}

export const getSession = cache(async () => {
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
    const cacheResult = await redisCache.getOrSet(
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
        { ttl: 300 }
    );
    const dbUser = cacheResult?.data;
    if (!dbUser) {
        console.warn(`[Session] User record not found for ID: ${user.id}`);
        return null;
    }

    // Return an object that matches the old Session interface exactly
    return {
        id: user.id,
        sessionId: session.id,
        email: user.email,
        name: user.name,
        roleName: dbUser.role?.name || "",
        roleSlug: dbUser.role?.slug || "",
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
});
