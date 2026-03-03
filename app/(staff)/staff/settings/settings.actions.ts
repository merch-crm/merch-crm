'use server'

import { db } from '@/lib/db'
import { presenceSettings } from '@/lib/schema/presence'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { checkIsAdmin } from '@/lib/admin'
import { logError } from '@/lib/error-logger'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getPresenceSettings() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const settings = await db.query.presenceSettings.findMany({ limit: 500 })

        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value as string | number | boolean
            return acc
        }, {} as Record<string, string | number | boolean>)

        return { success: true, data: settingsMap }
    } catch (error) {
        logError({ error: error as Error, path: 'settings.actions', method: 'getPresenceSettings' })
        return { success: false, error: 'Failed to fetch settings' }
    }
}

export async function updatePresenceSettings(updates: Record<string, string | number | boolean>) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        // Обработка обновлений: используем upsert или просто update если записи гарантированно есть
        // В миграции мы должны были инициализировать базовые настройки
        for (const [key, value] of Object.entries(updates)) {
            await db.insert(presenceSettings)
                .values({
                    key,
                    value,
                    updatedAt: new Date(),
                    updatedById: session.id
                })
                .onConflictDoUpdate({
                    target: presenceSettings.key,
                    set: {
                        value,
                        updatedAt: new Date(),
                        updatedById: session.id
                    }
                })
        }

        await logAction('Обновление настроек присутствия', 'presence_settings', 'bulk', updates)
        revalidatePath('/staff/settings')

        return { success: true }
    } catch (error) {
        logError({ error: error as Error, path: 'settings.actions', method: 'updatePresenceSettings' })
        return { success: false, error: 'Failed to update settings' }
    }
}

export async function testGo2rtcConnection() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const settings = await db.query.presenceSettings.findMany({
        limit: 500,
            where: eq(presenceSettings.key, 'go2rtc_url')
        })

        const go2rtcUrl = settings[0]?.value as string || 'http://localhost:1984'

        const response = await fetch(`${go2rtcUrl}/api`, {
            signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
            return { success: true, data: { status: 'connected', url: go2rtcUrl } }
        } else {
            return { success: false, error: 'go2rtc returned error' }
        }
    } catch {
        return { success: false, error: 'go2rtc not responding' }
    }
}

export async function testPythonService() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const pythonUrl = process.env.PRESENCE_SERVICE_URL || 'http://localhost:8001'

        const response = await fetch(`${pythonUrl}/health`, {
            signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
            const data = await response.json()
            return { success: true, data: { status: 'connected', ...data } }
        } else {
            return { success: false, error: 'Service returned error' }
        }
    } catch {
        return { success: false, error: 'Service not responding' }
    }
}
