import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";
import redis from "./redis";

const SECRET_KEY = env.JWT_SECRET_KEY;
if (!SECRET_KEY) throw new Error("JWT_SECRET_KEY is required");

const key = new TextEncoder().encode(SECRET_KEY);

export interface Session extends JWTPayload {
    id: string;
    email: string;
    name: string;
    roleName: string;
    roleId: string;
    departmentName: string;
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
        .setExpirationTime("24h")
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
        email: session.email,
        name: session.name || "",
        roleName: session.roleName || "",
        roleId: session.roleId || "",
        departmentName: session.departmentName || "",
        impersonatorId: session.impersonatorId,
        impersonatorName: session.impersonatorName,
        expires: session.expires,
    };
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const session = sessionCookie?.value;

    if (!session) return null;

    const isBlacklisted = await redis.get(`blacklist:${session}`);
    if (isBlacklisted) return null;

    try {
        return await decrypt(session);
    } catch {
        return null;
    }
}

export async function updateSession() {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get("session")?.value;
    if (!sessionValue) return;

    try {
        const parsed = await decrypt(sessionValue);
        const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        parsed.expires = newExpires;

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
        await redis.set(`blacklist:${session}`, "1", "EX", 24 * 60 * 60);
    }
    cookieStore.delete("session");
}

export { getSessionCookieOptions };
