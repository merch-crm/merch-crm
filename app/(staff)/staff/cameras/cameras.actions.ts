'use server'

import { db } from '@/lib/db'
import { xiaomiAccounts, cameras, workstations } from '@/lib/schema/presence'
import { systemSettings } from '@/lib/schema/system'
import { eq, desc, inArray } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { checkIsAdmin } from '@/lib/admin'
import { logError } from '@/lib/error-logger'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { encrypt, decrypt } from '@/lib/crypto'
import crypto from 'crypto'

interface XiaomiDevice {
    did: string
    name: string
    model: string
    localip: string
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

        const { username, password, region } = formData

        console.log(`[Xiaomi Login] Attempting login for ${username}, region: ${region}`)

        // Шаг 1: Получаем cookies и _sign
        const authResult = await xiaomiLogin(username, password, region)

        if (!authResult.success) {
            console.error(`[Xiaomi Login] Failed: ${authResult.error}`)
            return {
                success: false,
                error: authResult.error || 'Ошибка авторизации',
                verificationUrl: authResult.verificationUrl
            }
        }

        console.log(`[Xiaomi Login] Success for ${username}`)

        // Шифруем токены
        const encryptedToken = encrypt(JSON.stringify({
            serviceToken: authResult.serviceToken,
            userId: authResult.userId,
            ssecurity: authResult.ssecurity
        }))

        // Проверяем, есть ли уже такой аккаунт
        const existingAccount = await db.query.xiaomiAccounts.findFirst({
            where: eq(xiaomiAccounts.xiaomiUserId, authResult.userId!)
        })

        let accountId: string

        if (existingAccount) {
            await db.update(xiaomiAccounts)
                .set({
                    encryptedToken,
                    email: username,
                    nickname: authResult.nickname || username,
                    region,
                    isActive: true,
                    updatedAt: new Date()
                })
                .where(eq(xiaomiAccounts.id, existingAccount.id))

            accountId = existingAccount.id
        } else {
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

        await logAction('create', 'xiaomi_account', accountId, { email: username, region })
        revalidatePath('/staff/cameras')

        return {
            success: true,
            data: {
                accountId,
                nickname: authResult.nickname || username
            }
        }
    } catch (error) {
        console.error('[Xiaomi Login] Exception:', error)
        logError({ error: error as Error, path: 'cameras.actions', method: 'loginXiaomiAccount' })
        return { success: false, error: 'Ошибка подключения к Xiaomi' }
    }
}

// === Xiaomi Authentication ===

// Время жизни pending сессии - 15 минут
const PENDING_SESSION_TTL_MS = 15 * 60 * 1000

async function savePendingSession(username: string, data: {
    cookies: string
    sign: string
    sid: string
    callback: string
    baseUrl: string
    passwordHash: string
}) {
    const key = `xiaomi_pending_${crypto.createHash('md5').update(username).digest('hex')}`
    await db.insert(systemSettings)
        .values({
            key,
            value: { ...data, expiresAt: Date.now() + PENDING_SESSION_TTL_MS } as Record<string, unknown>,
            updatedAt: new Date(),
            createdAt: new Date()
        })
        .onConflictDoUpdate({
            target: systemSettings.key,
            set: {
                value: { ...data, expiresAt: Date.now() + PENDING_SESSION_TTL_MS } as Record<string, unknown>,
                updatedAt: new Date()
            }
        })
}

async function getPendingSession(username: string) {
    const key = `xiaomi_pending_${crypto.createHash('md5').update(username).digest('hex')}`
    const row = await db.query.systemSettings.findFirst({ where: eq(systemSettings.key, key) })
    if (!row) return null
    const data = row.value as Record<string, unknown>
    if ((data.expiresAt as number) < Date.now()) {
        // Просрочена
        await db.delete(systemSettings).where(eq(systemSettings.key, key))
        return null
    }
    return data as { cookies: string; sign: string; sid: string; callback: string; baseUrl: string; passwordHash: string }
}

async function clearPendingSession(username: string) {
    const key = `xiaomi_pending_${crypto.createHash('md5').update(username).digest('hex')}`
    await db.delete(systemSettings).where(eq(systemSettings.key, key))
}

async function xiaomiLogin(username: string, password: string, region: string): Promise<{
    success: boolean
    error?: string
    serviceToken?: string
    userId?: string
    ssecurity?: string
    nickname?: string
    verificationUrl?: string
}> {
    try {
        const baseUrl = 'https://account.xiaomi.com'
        const passwordHash = crypto.createHash('md5').update(password).digest('hex').toUpperCase()

        // Проверяем, есть ли сохранённая pending-сессия (после прохождения верификации)
        let pendingSession = await getPendingSession(username)

        let cookies: string
        let sign: string
        let sid: string
        let callback: string

        if (pendingSession) {
            // Используем сохранённые данные сессии
            console.log(`[Xiaomi Login] Reusing pending session for ${username}`)
            cookies = pendingSession.cookies
            sign = pendingSession.sign
            sid = pendingSession.sid
            callback = pendingSession.callback
        } else {
            // Шаг 1: Получаем начальные cookies
            console.log(`[Xiaomi Login] Step 1: Getting session cookies for ${username}`)
            const step1Response = await fetch(`${baseUrl}/pass/serviceLogin?sid=xiaomiio&_json=true`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Android-7.1.1-1.0.0-ONEPLUS A3010-136-NFVQWEASDFGHQWER MiijiaSDK/ONEPLUS A3010 App/xiaomi.smarthome APPV/62830',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            if (!step1Response.ok) {
                return { success: false, error: 'Не удалось подключиться к серверу Xiaomi' }
            }

            const step1Text = await step1Response.text()
            const step1Json = JSON.parse(step1Text.replace('&&&START&&&', ''))

            sign = step1Json._sign
            sid = step1Json.sid || 'xiaomiio'
            callback = step1Json.callback || 'https://sts.api.io.mi.com/sts'
            cookies = step1Response.headers.get('set-cookie') || ''
        }

        // Шаг 2: Авторизация
        const authParams = new URLSearchParams({
            'sid': sid,
            'hash': passwordHash,
            'callback': callback,
            'qs': '%3Fsid%3Dxiaomiio%26_json%3Dtrue',
            'user': username,
            '_sign': sign,
            '_json': 'true'
        })

        console.log(`[Xiaomi Login] Step 2: Authenticating ${username}`)
        const step2Response = await fetch(`${baseUrl}/pass/serviceLoginAuth2`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Android-7.1.1-1.0.0-ONEPLUS A3010-136-NFVQWEASDFGHQWER MiijiaSDK/ONEPLUS A3010 App/xiaomi.smarthome APPV/62830',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies
            },
            body: authParams.toString()
        })

        const step2Text = await step2Response.text()
        console.log(`[Xiaomi Login] Step 2 Raw Response: ${step2Text}`)
        const step2Json = JSON.parse(step2Text.replace('&&&START&&&', ''))
        console.log(`[Xiaomi Login] Step 2 JSON:`, JSON.stringify(step2Json, null, 2))

        if (step2Json.notificationUrl) {
            // Сохраняем сессию для следующей попытки (после верификации)
            console.log(`[Xiaomi Login] Saving pending session and returning verification URL`)
            await savePendingSession(username, { cookies, sign, sid, callback, baseUrl, passwordHash })
            return {
                success: false,
                error: 'Требуется подтверждение личности. Пожалуйста, перейдите по ссылке ниже, выполните подтверждение в браузере и попробуйте войти снова.',
                verificationUrl: step2Json.notificationUrl
            }
        }

        // Очищаем pending-сессию если она была
        if (pendingSession) {
            await clearPendingSession(username)
        }

        // Проверяем результат
        if (step2Json.code !== 0) {
            const errorMessages: Record<number, string> = {
                70016: 'Неверный логин или пароль',
                70001: 'Аккаунт не найден',
                70002: 'Аккаунт заблокирован',
                87001: 'Требуется подтверждение (включите 2FA или используйте пароль приложения)',
                [-32]: 'Слишком много попыток, попробуйте позже'
            }

            console.log(`[Xiaomi Login] Auth failed with code: ${step2Json.code}`)
            return {
                success: false,
                error: errorMessages[step2Json.code] || `Ошибка авторизации (код: ${step2Json.code})`
            }
        }

        const ssecurity = step2Json.ssecurity
        const userId = step2Json.userId?.toString() || step2Json.cUserId
        const location = step2Json.location
        const nickname = step2Json.nick || step2Json.nickname

        console.log(`[Xiaomi Login] Step 2 params: ssecurity=${!!ssecurity}, userId=${userId}, location=${!!location}`)

        if (!ssecurity || !userId) {
            console.error(`[Xiaomi Login] Missing critical params in Step 2 JSON`)
            return { success: false, error: 'Не удалось получить токен авторизации' }
        }

        // Шаг 3: Получаем serviceToken
        console.log(`[Xiaomi Login] Step 3: Fetching serviceToken from location`)
        const step3Response = await fetch(location, {
            method: 'GET',
            headers: {
                'User-Agent': 'Android-7.1.1-1.0.0-ONEPLUS A3010-136-NFVQWEASDFGHQWER MiijiaSDK/ONEPLUS A3010 App/xiaomi.smarthome APPV/62830'
            },
            redirect: 'manual'
        })

        const step3Cookies = step3Response.headers.get('set-cookie') || ''
        console.log(`[Xiaomi Login] Step 3 Cookies: ${step3Cookies}`)
        const serviceTokenMatch = step3Cookies.match(/serviceToken=([^;]+)/)
        const serviceToken = serviceTokenMatch ? serviceTokenMatch[1] : null

        if (!serviceToken) {
            return { success: false, error: 'Не удалось получить сервисный токен' }
        }

        return {
            success: true,
            serviceToken,
            userId,
            ssecurity,
            nickname
        }

    } catch (error) {
        console.error('[xiaomiLogin] Error:', error)
        return { success: false, error: 'Ошибка сети при подключении к Xiaomi' }
    }
}

// === Получение устройств ===

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

        const account = await db.query.xiaomiAccounts.findFirst({
            where: eq(xiaomiAccounts.id, accountId)
        })

        if (!account) {
            return { success: false, error: 'Аккаунт не найден' }
        }

        // Расшифровываем токены
        const tokens = JSON.parse(decrypt(account.encryptedToken))
        const { serviceToken, userId, ssecurity } = tokens

        // Получаем устройства
        const devices = await fetchXiaomiDevices(serviceToken, userId, ssecurity, account.region)

        if (!devices.success) {
            return { success: false, error: devices.error }
        }

        // Фильтруем камеры
        const cameraModels = ['chuangmi.camera', 'xiaomi.camera', 'isa.camera', 'lumi.camera']
        const cameraDevices = devices.devices!.filter((d: XiaomiDevice) =>
            cameraModels.some(model => d.model?.startsWith(model))
        )

        console.log(`[Sync] Found ${cameraDevices.length} cameras out of ${devices.devices!.length} devices`)

        // Синхронизируем
        let addedCount = 0
        let updatedCount = 0

        const deviceIds = cameraDevices.map(d => d.did)
        const existingCamerasList = await db.query.cameras.findMany({
            limit: 1000,
            where: inArray(cameras.deviceId, deviceIds)
        })

        const cameraMap = new Map(existingCamerasList.map(c => [c.deviceId, c]))

        for (const device of cameraDevices) {
            const existingCamera = cameraMap.get(device.did)

            const streamUrl = `rtsp://localhost:8554/xiaomi_${device.did}`

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

        await logAction('sync', 'cameras', accountId, { added: addedCount, updated: updatedCount })
        revalidatePath('/staff/cameras')

        return {
            success: true,
            data: { added: addedCount, updated: updatedCount, total: cameraDevices.length }
        }
    } catch (error) {
        console.error('[syncXiaomiDevices] Error:', error)
        logError({ error: error as Error, path: 'cameras.actions', method: 'syncXiaomiDevices' })
        return { success: false, error: 'Ошибка синхронизации' }
    }
}

async function fetchXiaomiDevices(
    serviceToken: string,
    userId: string,
    ssecurity: string,
    region: string
): Promise<{ success: boolean; error?: string; devices?: XiaomiDevice[] }> {
    try {
        // API endpoints по регионам
        const apiUrls: Record<string, string> = {
            'cn': 'https://api.io.mi.com/app',
            'de': 'https://de.api.io.mi.com/app',
            'us': 'https://us.api.io.mi.com/app',
            'ru': 'https://ru.api.io.mi.com/app',
            'tw': 'https://tw.api.io.mi.com/app',
            'sg': 'https://sg.api.io.mi.com/app',
            'in': 'https://i.api.io.mi.com/app'
        }

        const apiUrl = apiUrls[region] || apiUrls['cn']

        // Генерируем подпись запроса
        const nonce = generateNonce()
        const signedNonce = generateSignedNonce(ssecurity, nonce)

        const data = JSON.stringify({
            getVirtualModel: false,
            getHuamiDevices: 0
        })

        const params: Record<string, string> = {
            data,
            rc4_hash__: generateRc4Hash(signedNonce, data)
        }

        const signature = generateSignature(`/home/device_list`, signedNonce, nonce, params)

        const response = await fetch(`${apiUrl}/home/device_list`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Android-7.1.1-1.0.0-ONEPLUS A3010-136 MiijiaSDK/ONEPLUS A3010 App/xiaomi.smarthome APPV/62830',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': `userId=${userId}; serviceToken=${serviceToken}`,
                'x-xiaomi-protocal-flag-cli': 'PROTOCAL-HTTP2'
            },
            body: new URLSearchParams({
                ...params,
                signature,
                _nonce: nonce,
                ssecurity
            }).toString()
        })

        if (!response.ok) {
            return { success: false, error: 'Ошибка запроса к API Xiaomi' }
        }

        const result = await response.json()

        if (result.code !== 0) {
            return { success: false, error: result.message || 'Ошибка получения устройств' }
        }

        return { success: true, devices: result.result?.list || [] }

    } catch (error) {
        console.error('[fetchXiaomiDevices] Error:', error)
        return { success: false, error: 'Ошибка сети' }
    }
}

// === Crypto helpers ===

function generateNonce(): string {
    const buf = Buffer.alloc(12)
    buf.writeInt32BE(Math.floor(Math.random() * 1000000), 0)
    buf.writeInt32BE(Math.floor(Date.now() / 60000), 8)
    return buf.toString('base64')
}

function generateSignedNonce(ssecurity: string, nonce: string): string {
    const hash = crypto.createHash('sha256')
    hash.update(Buffer.from(ssecurity, 'base64'))
    hash.update(Buffer.from(nonce, 'base64'))
    return hash.digest('base64')
}

function generateSignature(
    uri: string,
    signedNonce: string,
    nonce: string,
    params: Record<string, string>
): string {
    const exps: string[] = [uri, signedNonce, nonce]

    const keys = Object.keys(params).sort()
    for (const key of keys) {
        exps.push(`${key}=${params[key]}`)
    }

    const signStr = exps.join('&')
    const hmac = crypto.createHmac('sha256', Buffer.from(signedNonce, 'base64'))
    hmac.update(signStr)
    return hmac.digest('base64')
}

function generateRc4Hash(signedNonce: string, data: string): string {
    const hmac = crypto.createHmac('sha256', Buffer.from(signedNonce, 'base64'))
    hmac.update(data)
    return hmac.digest('base64')
}

export async function getXiaomiAccounts() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const accounts = await db.query.xiaomiAccounts.findMany({
            limit: 1000,
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
            limit: 1000,
            with: {
                xiaomiAccount: {
                    columns: {
                        email: true,
                        nickname: true
                    }
                },
                workstations: {
                    columns: {
                        id: true,
                        name: true,
                        zone: true,
                        color: true
                    },
                    where: eq(workstations.isActive, true)
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
        const streamName = `xiaomi_${camera.deviceId}`

        try {
            const response = await fetch(`${go2rtcUrl}/api/streams`, {
                signal: AbortSignal.timeout(5000)
            })

            if (response.ok) {
                const streams = await response.json()
                const isOnline = !!(streams[streamName]?.producers?.length > 0)

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
        } catch (e) {
            console.error('[testCameraConnection] go2rtc error:', e)
            await db.update(cameras)
                .set({
                    status: 'error',
                    errorMessage: 'go2rtc not responding',
                    updatedAt: new Date()
                })
                .where(eq(cameras.id, cameraId))

            revalidatePath('/staff/cameras')

            return { success: false, error: 'Сервис go2rtc недоступен' }
        }

        return { success: false, error: 'Неизвестная ошибка' }
    } catch (error) {
        logError({ error: error as Error, path: 'cameras.actions', method: 'testCameraConnection' })
        return { success: false, error: 'Failed to test connection' }
    }
}
