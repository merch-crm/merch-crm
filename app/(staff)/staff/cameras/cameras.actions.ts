'use server'

import { db } from '@/lib/db'
import { xiaomiAccounts, cameras } from '@/lib/schema/presence'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { checkIsAdmin } from '@/lib/admin'
import { logError } from '@/lib/error-logger'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { decrypt, encrypt } from '@/lib/crypto'
import { XiaomiLoginInputSchema, SyncXiaomiDevicesSchema } from '../validation'

export async function getXiaomiAccounts() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const accounts = await db.query.xiaomiAccounts.findMany({
            where: eq(xiaomiAccounts.isActive, true),
            orderBy: [desc(xiaomiAccounts.createdAt)],
            columns: {
                id: true,
                xiaomiUserId: true,
                email: true,
                nickname: true,
                region: true,
                isActive: true,
                createdAt: true
            }
        })

        return { success: true, data: accounts }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'getXiaomiAccounts' })
        return { success: false, error: 'Failed to fetch accounts' }
    }
}

export async function getCameras() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const allCameras = await db.query.cameras.findMany({
            limit: 500,
            with: {
                xiaomiAccount: {
                    columns: {
                        email: true,
                        nickname: true
                    }
                }
            },
            orderBy: [desc(cameras.createdAt)]
        })

        return { success: true, data: allCameras }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'getCameras' })
        return { success: false, error: 'Failed to fetch cameras' }
    }
}

export async function loginXiaomiAccount(formData: {
    username: string
    password: string
    region: string
}) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        const parsed = XiaomiLoginInputSchema.safeParse(formData)
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        const { username, password, region } = parsed.data

        // Авторизация через Xiaomi Mi Home API (интеграция с go2rtc)
        const authResult = await authenticateXiaomi(username, password, region)

        if (!authResult.success) {
            return { success: false, error: authResult.error || 'Authentication failed' }
        }

        // Шифруем токен
        const encryptedToken = encrypt(authResult.token!)

        // Проверяем, есть ли уже такой аккаунт
        const existingAccount = await db.query.xiaomiAccounts.findFirst({
            where: eq(xiaomiAccounts.xiaomiUserId, authResult.userId!)
        })

        let accountId: string

        if (existingAccount) {
            // Обновляем существующий
            await db.update(xiaomiAccounts)
                .set({
                    encryptedToken,
                    email: username,
                    nickname: authResult.nickname,
                    isActive: true,
                    updatedAt: new Date()
                })
                .where(eq(xiaomiAccounts.id, existingAccount.id))

            accountId = existingAccount.id
        } else {
            // Создаём новый
            const [newAccount] = await db.insert(xiaomiAccounts).values({
                xiaomiUserId: authResult.userId!,
                email: username,
                nickname: authResult.nickname || username,
                encryptedToken,
                region,
                isActive: true,
                createdById: session.id
            }).returning()

            accountId = newAccount.id
        }

        await logAction('Подключен аккаунт Xiaomi', 'xiaomi_account', accountId, { email: username })
        revalidatePath('/staff/cameras')

        return {
            success: true,
            data: {
                accountId,
                nickname: authResult.nickname
            }
        }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'loginXiaomiAccount' })
        return { success: false, error: 'Failed to login' }
    }
}

export async function syncXiaomiDevices(accountId: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        const parsed = SyncXiaomiDevicesSchema.safeParse({ accountId })
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        // Получаем аккаунт с токеном
        const account = await db.query.xiaomiAccounts.findFirst({
            where: eq(xiaomiAccounts.id, parsed.data.accountId)
        })

        if (!account) {
            return { success: false, error: 'Account not found' }
        }

        // Расшифровываем токен
        const token = decrypt(account.encryptedToken)

        // Получаем устройства через Mi Home API
        const devicesResult = await fetchXiaomiDevices(token, account.region)

        if (!devicesResult.success) {
            return { success: false, error: devicesResult.error }
        }

        // Фильтруем только камеры
        const cameraDevices = devicesResult.devices!.filter(
            (d: { model?: string }) => d.model?.includes('camera') || d.model?.includes('chuangmi')
        )

        // Синхронизируем камеры в БД
        let addedCount = 0
        let updatedCount = 0

        for (const device of cameraDevices) {
            const existingCamera = await db.query.cameras.findFirst({
                where: eq(cameras.deviceId, device.did)
            })

            const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984'
            const streamUrl = `${go2rtcUrl}/api/stream.mp4?src=${device.did}`

            if (existingCamera) {
                await db.update(cameras)
                    .set({
                        name: device.name || existingCamera.name,
                        model: device.model,
                        localIp: device.localip,
                        streamUrl,
                        updatedAt: new Date()
                    })
                    .where(eq(cameras.id, existingCamera.id))
                updatedCount++
            } else {
                await db.insert(cameras).values({
                    xiaomiAccountId: accountId,
                    deviceId: device.did,
                    model: device.model,
                    name: device.name || `Camera ${device.did.slice(-4)}`,
                    localIp: device.localip,
                    streamUrl,
                    status: 'offline',
                    isEnabled: true,
                    confidenceThreshold: "0.6"
                })
                addedCount++
            }
        }

        await logAction('Синхронизация устройств Xiaomi', 'cameras', accountId, {
            added: addedCount,
            updated: updatedCount
        })

        revalidatePath('/staff/cameras')

        return {
            success: true,
            data: {
                added: addedCount,
                updated: updatedCount,
                total: cameraDevices.length
            }
        }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'syncXiaomiDevices' })
        return { success: false, error: 'Failed to sync devices' }
    }
}

export async function deleteXiaomiAccount(accountId: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        // Soft delete - просто деактивируем
        await db.update(xiaomiAccounts)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(eq(xiaomiAccounts.id, accountId))

        await logAction('Удаление аккаунта Xiaomi', 'xiaomi_account', accountId, {})
        revalidatePath('/staff/cameras')

        return { success: true }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'deleteXiaomiAccount' })
        return { success: false, error: 'Failed to delete account' }
    }
}

export async function toggleCamera(cameraId: string, enabled: boolean) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        await db.update(cameras)
            .set({
                isEnabled: enabled,
                updatedAt: new Date()
            })
            .where(eq(cameras.id, cameraId))

        await logAction(enabled ? 'Включение камеры' : 'Отключение камеры', 'camera', cameraId, { enabled })
        revalidatePath('/staff/cameras')

        return { success: true }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'toggleCamera' })
        return { success: false, error: 'Failed to toggle camera' }
    }
}

export async function updateCameraSettings(cameraId: string, data: {
    name?: string
    location?: string
    confidenceThreshold?: number
}) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        await db.update(cameras)
            .set({
                ...data,
                confidenceThreshold: data.confidenceThreshold?.toString(),
                updatedAt: new Date()
            })
            .where(eq(cameras.id, cameraId))

        await logAction('Обновление настроек камеры', 'camera', cameraId, data)
        revalidatePath('/staff/cameras')

        return { success: true }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'updateCameraSettings' })
        return { success: false, error: 'Failed to update camera' }
    }
}

export async function testCameraConnection(cameraId: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const camera = await db.query.cameras.findFirst({
            where: eq(cameras.id, cameraId)
        })

        if (!camera) {
            return { success: false, error: 'Camera not found' }
        }

        const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984'

        try {
            const response = await fetch(`${go2rtcUrl}/api/streams`, {
                signal: AbortSignal.timeout(5000)
            })

            if (response.ok) {
                const streams = await response.json()
                const streamName = `xiaomi_${camera.deviceId}`
                const isOnline = streams[streamName]?.producers?.length > 0

                await db.update(cameras)
                    .set({
                        status: isOnline ? 'online' : 'offline',
                        lastOnlineAt: isOnline ? new Date() : camera.lastOnlineAt,
                        errorMessage: null,
                        updatedAt: new Date()
                    })
                    .where(eq(cameras.id, cameraId))

                revalidatePath('/staff/cameras')

                return {
                    success: true,
                    data: {
                        status: isOnline ? 'online' : 'offline'
                    }
                }
            }
        } catch {
            await db.update(cameras)
                .set({
                    status: 'error',
                    errorMessage: 'go2rtc not responding',
                    updatedAt: new Date()
                })
                .where(eq(cameras.id, cameraId))

            revalidatePath('/staff/cameras')

            return { success: false, error: 'go2rtc service unavailable' }
        }

        return { success: false, error: 'Unknown error' }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'testCameraConnection' })
        return { success: false, error: 'Failed to test connection' }
    }
}

// === Вспомогательные функции для Xiaomi API ===

async function authenticateXiaomi(username: string, password: string, region: string) {
    try {
        // Используем go2rtc API для авторизации Xiaomi
        const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984'

        const response = await fetch(`${go2rtcUrl}/api/xiaomi/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, region }),
            signal: AbortSignal.timeout(30000)
        })

        if (!response.ok) {
            const error = await response.text()
            return { success: false, error: error || 'Authentication failed' }
        }

        const data = await response.json()

        return {
            success: true,
            token: data.token || data.access_token,
            userId: data.userId || data.user_id,
            nickname: data.nickname || data.nick
        }
    } catch (error) {
        console.error('Xiaomi auth error:', error)
        return { success: false, error: 'Connection failed' }
    }
}

async function fetchXiaomiDevices(token: string, region: string) {
    try {
        const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984'

        const response = await fetch(`${go2rtcUrl}/api/xiaomi/devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, region }),
            signal: AbortSignal.timeout(30000)
        })

        if (!response.ok) {
            return { success: false, error: 'Failed to fetch devices' }
        }

        const data = await response.json()

        return {
            success: true,
            devices: data.devices || data
        }
    } catch (error) {
        console.error('Xiaomi devices error:', error)
        return { success: false, error: 'Connection failed' }
    }
}
