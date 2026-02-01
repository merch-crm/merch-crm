import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";

const SECRET_KEY = env.JWT_SECRET_KEY || "hardcoded_secret_key_for_debugging_12345";
console.log("Using SECRET_KEY:", SECRET_KEY.substring(0, 5) + "...");
const key = new TextEncoder().encode(SECRET_KEY);

import { JWTPayload } from "jose";

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
    return payload as unknown as Session;
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const session = sessionCookie?.value;

    if (!session) return null;

    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}

export async function updateSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return;

    // Refresh implementation if needed
    // For now just basic session
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // extends by 1 day
    const res = new Response();
    res.headers.set(
        "Set-Cookie",
        `session=${session}; HttpOnly; SameSite=Lax; Expires=${parsed.expires.toUTCString()}`
    );
    return res;
}


