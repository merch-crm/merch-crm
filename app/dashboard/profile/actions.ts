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

import { uploadFile, getFileUrl } from "@/lib/storage";

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const department = formData.get("department") as string;
    const avatarFile = formData.get("avatar") as File;

    if (!name) return { error: "Имя обязательно" };

    try {
        const updateData: any = { name, phone, department };

        if (avatarFile && avatarFile.size > 0) {
            // Check for S3 configuration (support both REG_STORAGE and S3_ prefixes)
            const bucket = process.env.REG_STORAGE_BUCKET || process.env.S3_BUCKET;
            const accessKey = process.env.REG_STORAGE_ACCESS_KEY || process.env.S3_ACCESS_KEY;
            const secretKey = process.env.REG_STORAGE_SECRET_KEY || process.env.S3_SECRET_KEY;
            const endpoint = process.env.REG_STORAGE_ENDPOINT || process.env.S3_ENDPOINT || "https://s3.reg0.rusrv.ru";

            if (!bucket || !accessKey || !secretKey) {
                throw new Error("S3 хранилище не настроено (отсутствуют переменные окружения)");
            }

            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            const filename = `avatars/${session.id}-${Date.now()}.jpg`;

            // Upload to S3 (Reg.ru)
            const key = await uploadFile(filename, buffer, "image/jpeg");

            // Construct public URL
            const publicUrl = `${endpoint}/${bucket}/${key}`;
            updateData.avatar = publicUrl;
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, session.id));

        revalidatePath("/dashboard/profile");
        // Revalidate layout to update header avatar if safe
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating profile:", error);
        return { error: `Ошибка обновления профиля: ${error.message || String(error)}` };
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
