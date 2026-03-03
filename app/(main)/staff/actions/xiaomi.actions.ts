"use server";

import { db } from"@/lib/db";
import { xiaomiAccounts, cameras } from"@/lib/schema";
import { getSession } from"@/lib/auth";
import { requireAdmin } from"@/lib/admin";
import { logError } from"@/lib/error-logger";
import { logAction } from"@/lib/audit";
import { eq, and } from"drizzle-orm";
import { revalidatePath } from"next/cache";
import { XiaomiLoginSchema, XiaomiVerifySchema } from"../validation";
import { encrypt, decrypt } from"@/lib/crypto";

// Удалены локальные хелперы encrypt/decrypt

// Временное хранилище сессий верификации (в проде использовать Redis)
const verificationSessions = new Map<string, {
    username: string;
    password: string;
    region: string;
    expiresAt: number;
}>();

// ============================================
// ACTIONS
// ============================================

export async function getXiaomiAccounts() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const accounts = await db.query.xiaomiAccounts.findMany({
        limit: 500,
            where: eq(xiaomiAccounts.isActive, true),
            orderBy: (xa, { desc }) => [desc(xa.createdAt)],
            with: {
                cameras: true,
            },
        });

        // Убираем зашифрованные токены из ответа
        return {
            success: true,
            data: accounts.map(acc => ({
                ...acc,
                encryptedToken: undefined,
                camerasCount: acc.cameras.length,
            })),
        };
    } catch (error) {
        await logError({
            error,
            path:"/staff/xiaomi",
            method:"getXiaomiAccounts",
        });
        return { success: false, error:"Не удалось загрузить аккаунты Xiaomi" };
    }
}

export async function loginXiaomi(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data = Object.fromEntries(formData);
        const validated = XiaomiLoginSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { username, password, region } = validated.data;

        // Запрос к go2rtc для авторизации Xiaomi
        const go2rtcUrl = process.env.GO2RTC_URL ||"http://localhost:1984";

        const response = await fetch(`${go2rtcUrl}/api/xiaomi/login`, {
            method:"POST",
            headers: {"Content-Type":"application/json" },
            body: JSON.stringify({ username, password, region }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `Ошибка авторизации: ${errorText}` };
        }

        const result = await response.json();

        // Если требуется верификация
        if (result.requireVerification) {
            const sessionId = crypto.randomUUID();
            verificationSessions.set(sessionId, {
                username,
                password,
                region,
                expiresAt: Date.now() + 5 * 60 * 1000, // 5 минут
            });

            return {
                success: true,
                data: {
                    requireVerification: true,
                    verificationMethod: result.verificationMethod,
                    maskedContact: result.maskedContact,
                    sessionId,
                },
            };
        }

        // Успешная авторизация — сохраняем аккаунт
        const encryptedToken = encrypt(JSON.stringify(result.token));

        const [newAccount] = await db.insert(xiaomiAccounts).values({
            xiaomiUserId: result.userId,
            email: result.email || null,
            nickname: result.nickname || null,
            encryptedToken,
            region,
            createdById: session!.id,
        }).onConflictDoUpdate({
            target: xiaomiAccounts.xiaomiUserId,
            set: {
                encryptedToken,
                isActive: true,
                updatedAt: new Date(),
            },
        }).returning();

        await logAction("Добавлен аккаунт Xiaomi","xiaomi_account", newAccount.id, {
            xiaomiUserId: result.userId,
            region,
        });

        revalidatePath("/staff/cameras");

        return {
            success: true,
            data: {
                accountId: newAccount.id,
                nickname: result.nickname,
            },
        };
    } catch (error) {
        await logError({
            error,
            path:"/staff/xiaomi/login",
            method:"loginXiaomi",
        });
        return { success: false, error:"Ошибка при авторизации в Xiaomi" };
    }
}

export async function verifyXiaomi(formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data = Object.fromEntries(formData);
        const validated = XiaomiVerifySchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { code, sessionId } = validated.data;
        const pendingSession = verificationSessions.get(sessionId);

        if (!pendingSession || pendingSession.expiresAt < Date.now()) {
            verificationSessions.delete(sessionId);
            return { success: false, error:"Сессия истекла, повторите авторизацию" };
        }

        const go2rtcUrl = process.env.GO2RTC_URL ||"http://localhost:1984";

        const response = await fetch(`${go2rtcUrl}/api/xiaomi/verify`, {
            method:"POST",
            headers: {"Content-Type":"application/json" },
            body: JSON.stringify({
                username: pendingSession.username,
                password: pendingSession.password,
                region: pendingSession.region,
                code,
            }),
        });

        verificationSessions.delete(sessionId);

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `Ошибка верификации: ${errorText}` };
        }

        const result = await response.json();
        const encryptedToken = encrypt(JSON.stringify(result.token));

        const [newAccount] = await db.insert(xiaomiAccounts).values({
            xiaomiUserId: result.userId,
            email: result.email || null,
            nickname: result.nickname || null,
            encryptedToken,
            region: pendingSession.region,
            createdById: session!.id,
        }).onConflictDoUpdate({
            target: xiaomiAccounts.xiaomiUserId,
            set: {
                encryptedToken,
                isActive: true,
                updatedAt: new Date(),
            },
        }).returning();

        await logAction("Добавлен аккаунт Xiaomi (с верификацией)","xiaomi_account", newAccount.id, {
            xiaomiUserId: result.userId,
            region: pendingSession.region,
        });

        revalidatePath("/staff/cameras");

        return {
            success: true,
            data: {
                accountId: newAccount.id,
                nickname: result.nickname,
            },
        };
    } catch (error) {
        await logError({
            error,
            path:"/staff/xiaomi/verify",
            method:"verifyXiaomi",
        });
        return { success: false, error:"Ошибка при верификации" };
    }
}

export async function syncXiaomiDevices(accountId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const account = await db.query.xiaomiAccounts.findFirst({
            where: and(
                eq(xiaomiAccounts.id, accountId),
                eq(xiaomiAccounts.isActive, true)
            ),
        });

        if (!account) {
            return { success: false, error:"Аккаунт не найден" };
        }

        const token = JSON.parse(decrypt(account.encryptedToken));
        const go2rtcUrl = process.env.GO2RTC_URL ||"http://localhost:1984";

        const response = await fetch(`${go2rtcUrl}/api/xiaomi/devices`, {
            method:"POST",
            headers: {"Content-Type":"application/json" },
            body: JSON.stringify({
                token,
                region: account.region,
            }),
        });

        if (!response.ok) {
            return { success: false, error:"Не удалось получить список устройств" };
        }

        const devices: Array<{
            did: string;
            model: string;
            name: string;
            localIp: string | null;
            isOnline: boolean;
        }> = await response.json();

        // Фильтруем только камеры
        const cameraModels = ["xiaomi.camera","chuangmi.camera","isa.camera"];
        const cameraDevices = devices.filter(d =>
            cameraModels.some(prefix => d.model.startsWith(prefix))
        );

        // Синхронизируем камеры в БД
        for (const device of cameraDevices) {
            await db.insert(cameras).values({
                xiaomiAccountId: accountId,
                deviceId: device.did,
                model: device.model,
                name: device.name,
                localIp: device.localIp,
                status: device.isOnline ?"online" :"offline",
                lastOnlineAt: device.isOnline ? new Date() : null,
            }).onConflictDoUpdate({
                target: cameras.deviceId,
                set: {
                    name: device.name,
                    localIp: device.localIp,
                    status: device.isOnline ?"online" :"offline",
                    lastOnlineAt: device.isOnline ? new Date() : undefined,
                    updatedAt: new Date(),
                },
            });
        }

        // Обновляем время синхронизации аккаунта
        await db.update(xiaomiAccounts)
            .set({ lastSyncAt: new Date() })
            .where(eq(xiaomiAccounts.id, accountId));

        await logAction("Синхронизация устройств Xiaomi","xiaomi_account", accountId, {
            devicesFound: devices.length,
            camerasFound: cameraDevices.length,
        });

        revalidatePath("/staff/cameras");

        return {
            success: true,
            data: {
                total: devices.length,
                cameras: cameraDevices.length,
            },
        };
    } catch (error) {
        await logError({
            error,
            path:"/staff/xiaomi/sync",
            method:"syncXiaomiDevices",
        });
        return { success: false, error:"Ошибка при синхронизации устройств" };
    }
}

export async function deleteXiaomiAccount(accountId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const account = await db.query.xiaomiAccounts.findFirst({
            where: eq(xiaomiAccounts.id, accountId),
        });

        if (!account) {
            return { success: false, error:"Аккаунт не найден" };
        }

        // Мягкое удаление — деактивируем
        await db.update(xiaomiAccounts)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(xiaomiAccounts.id, accountId));

        await logAction("Удалён аккаунт Xiaomi","xiaomi_account", accountId, {
            xiaomiUserId: account.xiaomiUserId,
        });

        revalidatePath("/staff/cameras");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path:"/staff/xiaomi/delete",
            method:"deleteXiaomiAccount",
        });
        return { success: false, error:"Ошибка при удалении аккаунта" };
    }
}
