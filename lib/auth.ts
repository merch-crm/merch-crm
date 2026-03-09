import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";
import redis from "./redis";

const SECRET_KEY = env.JWT_SECRET_KEY;
if (!SECRET_KEY) throw new Error("JWT_SECRET_KEY is required");

const key = new TextEncoder().encode(SECRET_KEY);

export interface Session extends JWTPayload {
    id: string; // user ID
    sessionId: string; // DB session ID
    email: string;
    name: string;
    roleName: string;
    roleId: string;
    departmentName: string;
    ua?: string; // User-Agent hash/string for session binding
    impersonatorId?: string; // ID of the admin who is impersonating
    impersonatorName?: string; // Name of the admin who is impersonating
    expires?: Date;
}

/** Cookie options for the session cookie — single source of truth */
function getSessionCookieOptions(expires: Date) {
    return {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    };
}

export async function encrypt(payload: Session) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function decrypt(input: string): Promise<Session> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });

    // Validate required fields from JWT payload
    const session = payload as JWTPayload & Partial<Session>;
    if (!session.id || !session.email) {
        throw new Error("Invalid session payload: missing required fields");
    }

    return {
        ...payload,
        id: session.id,
        sessionId: session.sessionId || "",
        email: session.email,
        name: session.name || "",
        roleName: session.roleName || "",
        roleId: session.roleId || "",
        departmentName: session.departmentName || "",
        ua: session.ua,
        impersonatorId: session.impersonatorId,
        impersonatorName: session.impersonatorName,
        expires: session.expires,
    };
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const session = sessionCookie?.value;

    if (!session) {
        console.log("[Auth] No session cookie found");
        return null;
    }

    try {
        const isBlacklisted = await redis.get(`blacklist:${session}`);
        if (isBlacklisted) {
            console.log("[Auth] Session is blacklisted");
            return null;
        }
    } catch (e) {
        console.warn("⚠️ Redis blacklist check failed, allowing session (network error)", e);
    }

    try {
        const parsed = await decrypt(session);
        console.log("[Auth] Decrypted session:", parsed.email);

        // Security check: Verify User-Agent to prevent session hijacking
        const { headers } = await import("next/headers");
        const currentUa = (await headers()).get("user-agent") || "unknown";
        if (parsed.ua && parsed.ua !== currentUa) {
            console.warn(`[Auth] Session Hijacking attempt detected! UA mismatch. User: ${parsed.email}. Expected: ${parsed.ua}, Actual: ${currentUa}`);
            return null;
        }

        // Database Session Verification
        if (parsed.sessionId) {
            try {
                const { db } = await import('@/lib/db');
                if (!db.query || !db.query.sessions) {
                    console.error("[Auth] db.query.sessions is NOT available! Schema keys:", Object.keys(db.query || {}));
                    return parsed; // Fallback to JWT
                }
                const result = await db.query.sessions.findFirst({
                    where: (sessions, { eq }) => eq(sessions.id, parsed.sessionId)
                });
                if (!result) {
                    console.warn(`[Auth] DB Session missing or revoked. User: ${parsed.email}`);
                    return null; // Session revoked
                }
                console.log("[Auth] DB Session verified");
            } catch (dbError) {
                console.warn("[Auth] DB check failed (network). Allowing JWT fallback.", dbError);
            }
        }

        return parsed;
    } catch (e) {
        console.error("[Auth] Session validation error:", e);
        return null;
    }
}

export async function updateSession() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get("session")?.value;
    if (!sessionValue) return;

    try {
        const parsed = await decrypt(sessionValue);
        const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Re-encrypt with new expiration instead of reusing old token
        const newToken = await encrypt(parsed);

        cookieStore.set("session", newToken, getSessionCookieOptions(newExpires));
    } catch {
        // Invalid session — clear it
        cookieStore.delete("session");
    }
}

export async function logout() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (session) {
        // Add to blacklist for 24 hours
        try {
            await redis.set(`blacklist:${session}`, "1", "EX", 24 * 60 * 60);
        } catch {
            console.warn("⚠️ Failed to blacklist session on logout (Redis error)");
        }

        try {
            const parsed = await decrypt(session);
            if (parsed.sessionId) {
                const { pool } = await import('@/lib/db');
                await pool.query('DELETE FROM sessions WHERE id = $1', [parsed.sessionId]);
            }
        } catch {
            // Decryption failed or DB unreachable, continue deletion from cookies
        }
    }
    cookieStore.delete("session");
}

export { getSessionCookieOptions };
