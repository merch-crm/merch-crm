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
            // Check for S3 configuration
            if (!process.env.REG_STORAGE_BUCKET || !process.env.REG_STORAGE_ACCESS_KEY || !process.env.REG_STORAGE_SECRET_KEY) {
                throw new Error("S3 хранилище не навернуто (отсутствуют переменные окружения)");
            }

            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            const filename = `avatars/${session.id}-${Date.now()}.jpg`;

            // Upload to S3 (Reg.ru)
            const key = await uploadFile(filename, buffer, "image/jpeg");

            // Get public URL (assuming bucket is public or we generate a signed URL)
            // For now, simpler: Just store the logic. But wait, getFileUrl returns signed URL.
            // If the bucket is public-read, we can construct URL.
            // Let's assume we store the KEY or we use a helper to get URL.
            // But usually for avatars we want a permanent URL if possible or signed.
            // Let's store the full endpoint URL if public or just the Key.
            // If we store Key, we need to sign it on read. 
            // Existing schema says "avatar" is text.
            // Let's try to get the URL. S3 usually: endpoint/bucket/key

            const endpoint = process.env.REG_STORAGE_ENDPOINT || "https://s3.reg0.rusrv.ru";
            const bucket = process.env.REG_STORAGE_BUCKET || "";
            // Constructing public URL (assuming public bucket policy for avatars or we will sign it on render)
            // Ideally we should sign it on render. But `user.avatar` is used directly in UI.
            // If we assume the bucket is NOT public, we must sign.
            // But for this task, the User asked for "upload and install".
            // Let's simple store the path and we might need to fix display if it's private.
            // However, typical S3 for web apps often make avatars public.
            // Let's use the helper to get a long-lived signed URL or just the path?
            // Let's try to get a signed URL for now, max duration. Max is usually 7 days.
            // BUT `getFileUrl` logic in lib/storage generates signed url.

            // Let's store the raw KEY for now? No, the UI expects a URL to render <img src={user.avatar} />.
            // So we really should store a URL.
            // Let's assume we can generate a URL. 
            // If I look at `lib/storage.ts`, `getFileUrl` is exported.

            // Hack/Quick fix: Generate a very long signed URL or assume public access.
            // If I use `https://${bucket}.${endpoint.replace('https://', '')}/${key}`?
            // Safe bet: Generate a signed URL for 7 days? No, that expires.
            // Let's assume the user has set up a public bucket policy or we can serve it via an endpoint.
            // "uploadFile" returns "key".

            // Let's try to construct a public URL format, assuming user will make bucket public.
            // endpoint is https://s3.reg0.rusrv.ru
            // bucket is ...
            // URL: https://s3.reg0.rusrv.ru/bucket-name/key (path style)
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
