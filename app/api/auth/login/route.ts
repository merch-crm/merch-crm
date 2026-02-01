
import { encrypt } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { logSecurityEvent } from "@/lib/security-logger";
import { logError } from "@/lib/error-logger";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
        }

        // console.log(`[API Login] Attempting login for email: '${email}'`);

        const { pool } = await import('@/lib/db');

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 LIMIT 1',
            [email]
        );

        const user = result.rows;

        if (user.length === 0) {
            await logSecurityEvent({
                eventType: "login_failed",
                severity: "warning",
                entityType: "auth",
                details: { email, reason: 'user_not_found' }
            });
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        const passwordsMatch = await comparePassword(
            password,
            user[0].password_hash
        );

        if (!passwordsMatch) {
            await logSecurityEvent({
                eventType: "login_failed",
                userId: user[0].id,
                severity: "warning",
                entityType: "auth",
                entityId: user[0].id,
                details: { email, reason: 'password_mismatch' }
            });
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        let role = null;
        if (user[0].role_id) {
            const roleResult = await pool.query(
                'SELECT * FROM roles WHERE id = $1 LIMIT 1',
                [user[0].role_id]
            );
            role = roleResult.rows[0] || null;
        }

        let department = null;
        if (user[0].department_id) {
            const deptResult = await pool.query(
                'SELECT * FROM departments WHERE id = $1 LIMIT 1',
                [user[0].department_id]
            );
            department = deptResult.rows[0] || null;
        }

        const sessionData = {
            id: user[0].id,
            email: user[0].email,
            roleId: user[0].role_id || "",
            roleName: role?.name || "User",
            departmentName: department?.name || user[0].department || "",
            name: user[0].name || "",
            expires,
        };

        const session = await encrypt(sessionData);

        // Create response with redirect
        const response = NextResponse.json({ success: true });

        // Set cookies directly on response
        response.cookies.set("session", session, {
            expires,
            httpOnly: true, // Secure cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        // Log success
        await logSecurityEvent({
            eventType: "login_success",
            userId: user[0].id,
            severity: "info",
            entityType: "auth",
            entityId: user[0].id,
            details: {
                email: user[0].email,
                name: user[0].name,
                role: role?.name
            }
        });

        console.log(`[API Login] Cookie set, returning success`);
        return response;

    } catch (error) {
        await logError({
            error,
            path: "/api/auth/login",
            method: "POST",
            details: {}
        });
        console.error("[API Login] Execution error:", error);
        return NextResponse.json({ error: `Ошибка сервера: ${(error as Error).message}` }, { status: 500 });
    }
}
