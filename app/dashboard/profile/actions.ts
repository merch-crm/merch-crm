"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession, comparePassword, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function logout() {
    (await cookies()).delete("session");
}

export async function getUserProfile() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });

        if (!user) return { error: "User not found" };

        return { data: user };
    } catch (error) {
        console.error("Error fetching profile:", error);
        return { error: "Failed to fetch profile" };
    }
}

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const department = formData.get("department") as string;

    if (!name) return { error: "Имя обязательно" };

    try {
        await db.update(users)
            .set({ name, phone, department })
            .where(eq(users.id, session.id));

        revalidatePath("/dashboard/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Failed to update profile" };
    }
}

export async function updatePassword(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Заполните все поля" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Пароли не совпадают" };
    }

    if (newPassword.length < 6) {
        return { error: "Новый пароль должен быть не менее 6 символов" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id)
        });

        if (!user) return { error: "Пользователь не найден" };

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) return { error: "Текущий пароль указан неверно" };

        const newHash = await hashPassword(newPassword);
        await db.update(users)
            .set({ passwordHash: newHash })
            .where(eq(users.id, session.id));

        return { success: true };
    } catch (error) {
        console.error("Error updating password:", error);
        return { error: "Failed to update password" };
    }
}
