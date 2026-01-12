"use server";

import { db } from "@/lib/db";
import { users, roles } from "@/lib/schema";
import { comparePassword, encrypt } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Заполните все поля" };
    }

    try {
        console.log(`[Login] Attempting login for email: ${email}`);
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (user.length === 0) {
            console.log(`[Login] User not found: ${email}`);
            return { error: "Неверный email или пароль" };
        }

        console.log(`[Login] User found, comparing passwords...`);
        const passwordsMatch = await comparePassword(
            password,
            user[0].passwordHash
        );

        if (!passwordsMatch) {
            console.log(`[Login] Password mismatch for user: ${email}`);
            return { error: "Неверный email или пароль" };
        }

        console.log(`[Login] Password matched, creating session...`);
        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Fetch role name for session
        const role = user[0].roleId ? await db.query.roles.findFirst({
            where: eq(roles.id, user[0].roleId)
        }) : null;

        const session = await encrypt({
            id: user[0].id,
            email: user[0].email,
            roleId: user[0].roleId,
            roleName: role?.name || "User",
            name: user[0].name,
            expires,
        });

        console.log(`[Login] Session encrypted, setting cookie...`);
        (await cookies()).set("session", session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "lax",
        });
        console.log(`[Login] Cookie set, redirecting to dashboard...`);
    } catch (error) {
        console.error("[Login] Execution error:", error);
        return { error: "Ошибка сервера" };
    }

    redirect("/dashboard");
}
